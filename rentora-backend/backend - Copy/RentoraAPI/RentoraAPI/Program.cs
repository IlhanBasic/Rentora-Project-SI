﻿using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Identity.UI;
using RentoraAPI.Data;
using RentoraAPI.Models;
using RentoraAPI.Respositories;
using RentoraAPI.Services;
using System.Security.Claims;
using System.Text;
using System.Configuration;
using RentoraAPI.GraphQL.Schema.Queries;
using RentoraAPI.GraphQL.Services.Locations;
using RentoraAPI.GraphQL.Schema.Mutations;
using RentoraAPI.GraphQL.Services.Vehicles;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container
builder.Services.AddControllers()
	.AddJsonOptions(options =>
	{
		options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
	});

// Configure CORS
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAllOrigins", policyBuilder =>
	{
		policyBuilder.AllowAnyOrigin()
					 .AllowAnyMethod()
					 .AllowAnyHeader();
	});
});

builder.Services
	.AddGraphQLServer()
	.AddAuthorization()
	.AddQueryType<Query>()
	.AddMutationType<Mutation>();
// Register the Mutation type
builder.Services.AddScoped<Mutation>();

// Configure Entity Framework with SQL Server and DbContextFactory
builder.Services.AddPooledDbContextFactory<RentoraDBContext>(options =>
	options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Also add regular DbContext for Identity and other non-GraphQL parts
builder.Services.AddDbContext<RentoraDBContext>(options =>
	options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repositories
builder.Services.AddScoped<ITokenRepository, TokenRepository>();
var smtpSettings = builder.Configuration.GetSection("SmtpSettings").Get<SmtpSettings>();
builder.Services.AddSingleton(smtpSettings);
//builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddSingleton<IEmailSender, EmailSender>();	
builder.Services.AddScoped<LocationsRepository>();
builder.Services.AddScoped<VehicleRepository>();
builder.Services.AddControllersWithViews();

// Configure Identity with the custom User class and add Default UI
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
	options.Password.RequireDigit = true;
	options.Password.RequireUppercase = true;
	options.Password.RequiredLength = 6;
	options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<RentoraDBContext>()
.AddDefaultUI()
.AddDefaultTokenProviders();

// Configure JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidateAudience = true,
			ValidateLifetime = true,
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
			RoleClaimType = ClaimTypes.Role,
			ValidIssuer = builder.Configuration["Jwt:Issuer"],
			ValidAudience = builder.Configuration["Jwt:Audience"]
		};
	});
builder.Services.AddAuthorization(options =>
{
	options.AddPolicy("AdminPolicy", policy =>
		policy.RequireRole("Admin")); 
});

// Configure Cookie settings to prevent redirection on unauthorized access
builder.Services.ConfigureApplicationCookie(options =>
{
	options.Events.OnRedirectToLogin = context =>
	{
		context.Response.StatusCode = StatusCodes.Status401Unauthorized;
		return Task.CompletedTask;
	};
	options.Events.OnRedirectToAccessDenied = context =>
	{
		context.Response.StatusCode = StatusCodes.Status403Forbidden;
		return Task.CompletedTask;
	};
});

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
	options.SwaggerDoc("v1", new OpenApiInfo { Title = "RentoraAPI", Version = "v1" });
	options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
	{
		Name = "Authorization",
		In = ParameterLocation.Header,
		Type = SecuritySchemeType.ApiKey,
		Scheme = JwtBearerDefaults.AuthenticationScheme
	});
	options.AddSecurityRequirement(new OpenApiSecurityRequirement
	{
		{
			new OpenApiSecurityScheme
			{
				Reference = new OpenApiReference
				{
					Type = ReferenceType.SecurityScheme,
					Id = JwtBearerDefaults.AuthenticationScheme
				}
			},
			new string[] {}
		}
	});
});

var app = builder.Build();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGraphQL();
app.Run();