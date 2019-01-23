using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using server.Data;

namespace server
{
  public class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddMvc();

      // connection string stored in app service, not code
      // Use SQL Database if in Azure, otherwise, use SQLite
      if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production") {
        services.AddDbContext<DatabaseContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("dbconstring")));
      }
      else if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development") {
        services.AddDbContext<DatabaseContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("dbconstring")));
      }
      else {
        services.AddDbContext<DatabaseContext>(options =>
                options.UseSqlite("Data Source=localdatabase.db"));
      }

      // Automatically perform database migration
      services.BuildServiceProvider().GetService<DatabaseContext>().Database.Migrate();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }
      app.UseDeveloperExceptionPage();

      app.UseDefaultFiles(new DefaultFilesOptions
      {
        DefaultFileNames = new
           List<string> { "index.html" }
      });
      app.UseStaticFiles();
      app.UseMvc();
    }
  }
}
