using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
  public class ScoreRecord
  {
    // constructor for HTTP POST initialisation
    public ScoreRecord() { }
    // constructor for c# initialisation
    public ScoreRecord(string name, int score)
    {
      Name = name;
      Score = score;
    }

    public string Name { get; set; }
    public int Score { get; set; }
  }

}