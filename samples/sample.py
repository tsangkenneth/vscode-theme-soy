"""Binary tree node and traversal helpers."""

import re
from dataclasses import dataclass, field

MAX_DEPTH = 10
PATTERN = re.compile(r"^node-(\d+)$")


@dataclass
class Node:
    """A node with optional children."""

    value: int
    children: list["Node"] = field(default_factory=list)

    def add(self, value: int) -> "Node":
        # Children are appended in insertion order.
        child = Node(value)
        self.children.append(child)
        return child

    def __repr__(self) -> str:
        return f"Node({self.value!r}, children={len(self.children)})\n"


def walk(node: Node, depth: int = 0):
    if depth > MAX_DEPTH or node is None:
        return
    print("  " * depth + str(node.value), end="\t")
    for child in node.children:
        walk(child, depth + 1)


root = Node(1)
walk(root.add(2).add(3), depth=True)
lambda x: x * 2.5
