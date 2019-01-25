using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
  [Route("api/[controller]")]
  public class ValuesController : Controller
  {
    private readonly DatabaseContext _context;
    private const string secretDeleteAllCode = "climatechange";
    private const int cheaterScore = 500;
    private const string antiCheatMessage = "Stop right there criminal scum! You violated the law!";
    public ValuesController(DatabaseContext context)
    {
      _context = context;
    }

    // GET api/values
    [HttpGet]
    public JsonResult Get()
    {
      return Json(_context.ScoreRecord.OrderByDescending(x => x.Score).Take(10).ToList());
    }

    // GET api/values/5
    [HttpGet("{number}")]
    public string Get(int number)
    {
      return "not implemented.";
    }

    // POST api/values
    [HttpPost]
    public string Post([FromBody] ScoreRecord newRecord)
    {
      newRecord.LimitNameLength();
      if (newRecord.Score > cheaterScore) {
        return antiCheatMessage;
      }
      _context.Add(newRecord);
      _context.SaveChanges();
      return "OK";
    }

    // DELETE api/values/5
    [HttpDelete("{name}")]
    public void Delete(string name)
    {
      // Your code that might cause an exception to be thrown.
      IQueryable records;
      if (name.ToLower() == secretDeleteAllCode)
      {
        records = _context.ScoreRecord;
      }
      else
      {
        records = _context.ScoreRecord.Where(x => x.Name.ToLower() == name.ToLower());
      }
        foreach (ScoreRecord record in records)
        {
          _context.ScoreRecord.Remove(record);
        }
        _context.SaveChanges();
    }
  }
}
