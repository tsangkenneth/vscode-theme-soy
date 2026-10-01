package main

import (
	"fmt"
	"strings"
)

// Shape is anything with an area.
type Shape interface {
	Area() float64
}

type Rect struct {
	Width, Height float64
}

const maxShapes = 10

func (r Rect) Area() float64 {
	return r.Width * r.Height
}

// Describe returns a summary of the shapes.
func Describe(shapes []Shape) string {
	var b strings.Builder
	for i, s := range shapes {
		if i >= maxShapes {
			break
		}
		fmt.Fprintf(&b, "%d: %.2f\n", i, s.Area())
	}
	return b.String()
}

func main() {
	shapes := []Shape{Rect{Width: 2, Height: 3.5}}
	fmt.Println(Describe(shapes), true, nil)
}
