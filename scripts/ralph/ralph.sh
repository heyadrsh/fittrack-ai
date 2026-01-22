#!/bin/bash
# Ralph for Claude Code
# Usage: ./ralph.sh [max_iterations]

set -e

MAX_ITERATIONS=${1:-50}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

# Initialize progress file if needed
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "Starting Ralph with Claude Code - Max iterations: $MAX_ITERATIONS"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "═══════════════════════════════════════════════════════"

  # Run Claude Code with the prompt
  OUTPUT=$(claude --dangerously-skip-permissions -p "$(cat $SCRIPT_DIR/prompt.md)" 2>&1 | tee /dev/stderr) || true

  # Check for completion
  if echo "$OUTPUT" | grep -q "RALPH_COMPLETE"; then
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  Ralph completed all 50 user stories!"
    echo "═══════════════════════════════════════════════════════"
    exit 0
  fi

  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Reached max iterations ($MAX_ITERATIONS)"
exit 1
