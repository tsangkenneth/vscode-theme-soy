import { useState } from "react";

type Props = { label: string; initial?: number };

// A button that counts its clicks.
export function Counter({ label, initial = 0 }: Props) {
  const [count, setCount] = useState(initial);
  return (
    <div className="counter" data-count={count}>
      <Button onClick={() => setCount(count + 1)}>
        {label}: {count}
      </Button>
      <br />
    </div>
  );
}
