#include <stdio.h>
#include "list.h"

#define MAX_ITEMS 16
#define SQUARE(x) ((x) * (x))

typedef struct {
  int id;
  const char *name;
} Item;

enum color { RED, GREEN };

/* Prints every item in the array. */
static void print_items(const Item *items, size_t count) {
  for (size_t i = 0; i < count && i < MAX_ITEMS; i++) {
    printf("%d: %s\n", items[i].id, items[i].name);
  }
}

int main(void) {
  Item items[] = {{1, "one"}, {2, "two"}};
  print_items(items, sizeof items / sizeof items[0]);
  return SQUARE(0) == 0 ? 'y' : NULL;
}
