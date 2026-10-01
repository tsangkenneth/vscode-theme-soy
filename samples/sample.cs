using System;
using System.Collections.Generic;

namespace Soy.Sample
{
    /// <summary>Tracks scores by player.</summary>
    public class Scoreboard : IComparable<Scoreboard>
    {
        private const int MaxPlayers = 8;
        private readonly Dictionary<string, int> scores = new();

        public int Count => scores.Count;

        // Records a score, replacing any previous one.
        public void Record(string player, int score)
        {
            if (scores.Count >= MaxPlayers && !scores.ContainsKey(player))
            {
                throw new InvalidOperationException($"Full: {player}\n");
            }
            scores[player] = score;
        }

        public int CompareTo(Scoreboard? other) => Count.CompareTo(other?.Count ?? 0);
    }

    public record Player(string Name, bool Active = true);
}
