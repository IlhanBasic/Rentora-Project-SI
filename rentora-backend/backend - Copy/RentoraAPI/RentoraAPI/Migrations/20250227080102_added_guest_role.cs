using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentoraAPI.Migrations
{
    /// <inheritdoc />
    public partial class added_guest_role : Migration
    {
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.InsertData(
				table: "AspNetRoles",
				columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
				values: new object[]
				{
				"7bda1483-88c3-42fb-9643-22e064ad8f0f",
				"7bda1483-88c3-42fb-9643-22e064ad8f0f",
                "Guest",
                "GUEST"  
				});
		}

		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DeleteData(
				table: "AspNetRoles",
				keyColumn: "Id",
				keyValue: "7bda1483-88c3-42fb-9643-22e064ad8f0f");
		}
	}
}
