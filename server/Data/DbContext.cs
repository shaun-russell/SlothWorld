using System;
using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
  public class DatabaseContext : DbContext
  {
    public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
    {
      // empty
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ScoreRecord>()
            .ToTable("ScoreRecord");
        modelBuilder.Entity<ScoreRecord>()
            .Property(sr => sr.ID)
            .ValueGeneratedOnAdd();
    }
    public DbSet<ScoreRecord> ScoreRecord { get; set; }
  }
}