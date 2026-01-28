using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectService.Migrations
{
    /// <inheritdoc />
    public partial class MakeProjectTemplateIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectGroups_ProjectTemplates_ProjectTemplateId",
                table: "ProjectGroups");

            migrationBuilder.AlterColumn<Guid>(
                name: "ProjectTemplateId",
                table: "ProjectGroups",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectGroups_ProjectTemplates_ProjectTemplateId",
                table: "ProjectGroups",
                column: "ProjectTemplateId",
                principalTable: "ProjectTemplates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectGroups_ProjectTemplates_ProjectTemplateId",
                table: "ProjectGroups");

            migrationBuilder.AlterColumn<Guid>(
                name: "ProjectTemplateId",
                table: "ProjectGroups",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectGroups_ProjectTemplates_ProjectTemplateId",
                table: "ProjectGroups",
                column: "ProjectTemplateId",
                principalTable: "ProjectTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
