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

    public DbSet<ScoreRecord> ScoreRecord { get; set; }
  }
}