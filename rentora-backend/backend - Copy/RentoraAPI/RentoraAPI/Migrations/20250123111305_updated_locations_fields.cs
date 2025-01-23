using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentoraAPI.Migrations
{
    /// <inheritdoc />
    public partial class updated_locations_fields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Location",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Location",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "Location");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Location");
        }
    }
}
