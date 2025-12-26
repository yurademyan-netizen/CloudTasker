using CloudTasker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CloudTasker.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Це наша таблиця "Tasks" у базі даних
        public DbSet<TaskItem> Tasks { get; set; }
    }
}