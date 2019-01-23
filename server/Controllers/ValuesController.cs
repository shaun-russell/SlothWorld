using System;
using System.Collections.Generic;
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
    public async Task<JsonResult> Get()
    {
      return Json(await _context.ScoreRecords.OrderByDescending(x => x.Score).Take(10).ToListAsync());
    }

    // GET api/values/5
    [HttpGet("{number}")]
    public string Get(int number)
    {
      return "not implemented.";
    }

    // POST api/values
    [HttpPost]
    public async void Post([FromBody] ScoreRecord newRecord)
    {
      _context.Add(newRecord);
      await _context.SaveChangesAsync();
    }

    // DELETE api/values/5
    [HttpDelete("{name}")]
    public async void Delete(string name)
    {
      Console.WriteLine($"Bad name: {name}");
      IQueryable records;
      if (name.ToLower() == secretDeleteAllCode) {
        records = _context.ScoreRecords;
      }
      else {
        records = _context.ScoreRecords.Where(x => x.Name.ToLower() == name.ToLower());
      }
      foreach (ScoreRecord record in records) {
        Console.WriteLine("Removing record.");
        _context.ScoreRecords.Remove(record);
      }
      await _context.SaveChangesAsync();
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
