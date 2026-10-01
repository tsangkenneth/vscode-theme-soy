package dev.soy.sample;

import java.util.ArrayList;
import java.util.List;

/**
 * Keeps a list of names.
 *
 * @author soy
 */
public class Sample implements Comparable<Sample> {
  private static final int MAX = 100;
  private final List<String> names = new ArrayList<>();

  @Override
  public int compareTo(Sample other) {
    return Integer.compare(names.size(), other.names.size());
  }

  // Adds a name if there is room.
  public boolean add(String name) {
    if (names.size() >= MAX || name == null) {
      return false;
    }
    names.add(name.trim());
    System.out.printf("Added %s\n", name);
    return true;
  }

  enum Status { ACTIVE, INACTIVE }

  public static void main(String[] args) {
    Sample sample = new Sample();
    sample.add("soy");
    double ratio = 0.5f;
  }
}
