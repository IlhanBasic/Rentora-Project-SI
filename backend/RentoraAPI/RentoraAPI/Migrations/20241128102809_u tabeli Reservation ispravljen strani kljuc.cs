using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentoraAPI.Migrations
{
    /// <inheritdoc />
    public partial class utabeliReservationispravljenstranikljuc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservation_Vehicle_VehicleId",
                table: "Reservation");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservation_Vehicle_VehicleId",
                table: "Reservation",
                column: "VehicleId",
                principalTable: "Vehicle",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservation_Vehicle_VehicleId",
                table: "Reservation");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservation_Vehicle_VehicleId",
                table: "Reservation",
                column: "VehicleId",
                principalTable: "Vehicle",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
