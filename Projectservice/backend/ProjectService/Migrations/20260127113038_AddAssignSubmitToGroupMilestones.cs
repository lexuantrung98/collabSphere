using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectService.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignSubmitToGroupMilestones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssignedTo",
                table: "GroupMilestones",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubmissionContent",
                table: "GroupMilestones",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubmissionFilePath",
                table: "GroupMilestones",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                table: "GroupMilestones",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubmittedBy",
                table: "GroupMilestones",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedTo",
                table: "GroupMilestones");

            migrationBuilder.DropColumn(
                name: "SubmissionContent",
                table: "GroupMilestones");

            migrationBuilder.DropColumn(
                name: "SubmissionFilePath",
                table: "GroupMilestones");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "GroupMilestones");

            migrationBuilder.DropColumn(
                name: "SubmittedBy",
                table: "GroupMilestones");
        }
    }
}
