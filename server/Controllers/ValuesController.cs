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
    public void Post([FromBody] ScoreRecord newRecord)
    {
      try
      {
        _context.Add(newRecord);
        _context.SaveChanges();
      }
      catch (Exception ex)
      {
        Trace.TraceError("POST Exception: " + ex.ToString());
        throw;
      }
    }

    // DELETE api/values/5
    [HttpDelete("{name}")]
    public void Delete(string name)
    {
      try
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
      catch (Exception ex)
      {
        Trace.TraceError("DELETE Exception: " + ex.ToString());
        throw;
      }
    }
  }

  class TemporaryDatabase
  {
    public TemporaryDatabase()
    {
      // generate some test data for a leaderboard
      scoreRecords = new List<ScoreRecord>();
      Random rando = new Random();
      add("Leyton Cowan", rando.Next(5, 80));
      add("Ryan Reeves", rando.Next(5, 80));
      add("Sandra Gaines", rando.Next(5, 80));
      add("Ashlyn Woodward", rando.Next(5, 80));
      add("Theresa Keller", rando.Next(5, 80));
      add("Matthew Jefferson", rando.Next(5, 80));
      add("Akram Kinney", rando.Next(5, 80));
      add("Winifred Peel", rando.Next(5, 80));
      add("Leo Fulton", rando.Next(5, 80));
      add("Ella Medina", rando.Next(5, 80));
    }

    private void add(string name, int score)
    {
      scoreRecords.Add(new ScoreRecord(name, score));
    }

    private List<ScoreRecord> scoreRecords;

    public List<ScoreRecord> GetTopNRecords(int topN)
    {
      return scoreRecords.OrderByDescending(x => x.Score).Take(topN).ToList();
    }

    private char[] badChars = { '*', ' ', '\'', '/' };
    public void AddNewScore(ScoreRecord newRecord)
    {
      newRecord.Name = newRecord.Name.Trim(badChars);
      scoreRecords.Add(newRecord);
    }
  }
}
