using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Life.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSettingsReminderTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeOnly>(
                name: "ReminderTime",
                table: "UserSettings",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReminderTime",
                table: "UserSettings");
        }
    }
}
