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

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ID { get; set; }
    public string Name { get; set; }
    public int Score { get; set; }
  }

}