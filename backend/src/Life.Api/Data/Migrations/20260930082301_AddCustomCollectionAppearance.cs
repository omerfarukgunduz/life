using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Life.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomCollectionAppearance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ColorKey",
                table: "CustomCollections",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IconKey",
                table: "CustomCollections",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColorKey",
                table: "CustomCollections");

            migrationBuilder.DropColumn(
                name: "IconKey",
                table: "CustomCollections");
        }
    }
}
