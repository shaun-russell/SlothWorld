using System;
using Microsoft.EntityFrameworkCore;

namespace server.Data {
  public class DatabaseContext : DbContext
  {
      public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) {
        // empty
      }

      public DbSet<server.Models
  }
}