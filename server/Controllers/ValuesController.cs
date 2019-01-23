using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace server.Controllers
{
  [Route("api/[controller]")]
  public class ValuesController : Controller
  {
    private static int requestCount = 0;
    private static TemporaryDatabase tempData = new TemporaryDatabase();

    // GET api/values
    [HttpGet]
    public string Get()
    {
      requestCount++;
      return $"server has said hello {requestCount} times.";
    }

    // GET api/values/5
    [HttpGet("{number}")]
    public JsonResult Get(int number)
    {
      var records = tempData.GetTopNRecords(number);
      return Json(records);
    }

    // POST api/values
    [HttpPost]
    public void Post([FromBody] ScoreRecord newRecord)
    {
      tempData.AddNewScore(newRecord);
      Console.WriteLine($"New record: {newRecord.Name} has a score of {newRecord.Score}.");
    }

    // PUT api/values/5
    [HttpPut("{id}")]
    public void Put(int id, [FromBody]string value)
    {
    }

    // DELETE api/values/5
    [HttpDelete("{id}")]
    public void Delete(int id)
    {
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

  public class ScoreRecord
  {
    public ScoreRecord() { }
    public ScoreRecord(string name, int score)
    {
      Name = name;
      Score = score;
    }

    public string Name { get; set; }

    public int Score { get; set; }
  }

}
