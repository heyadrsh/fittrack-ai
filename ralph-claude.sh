#!/bin/bash
# Ralph for Claude Code - Long-running AI agent loop
# Usage: ./ralph-claude.sh [max_iterations]

set -e

MAX_ITERATIONS=${1:-50}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo -e "${GREEN}Starting Ralph (Claude Code) - Max iterations: $MAX_ITERATIONS${NC}"
echo ""

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}  Ralph Iteration $i of $MAX_ITERATIONS${NC}"
  echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
  echo ""

  # Create iteration-specific prompt
  ITERATION_PROMPT="Read the file prompt.md for your instructions.
Read prd.json to find the next story where passes: false (sorted by priority).
Read progress.txt for context from previous iterations.
Read AGENTS.md for implementation guidelines.

Work on ONE story only. When done:
1. Run 'npm run build' and 'npm run lint' to verify
2. Commit your changes with: feat: [Story ID] - [Story Title]
3. Update prd.json to set passes: true for the completed story
4. Append your progress to progress.txt

If ALL stories have passes: true, respond with: RALPH_COMPLETE"

  # Run Claude Code in non-interactive mode
  echo "Running Claude Code for story implementation..."
  OUTPUT=$(echo "$ITERATION_PROMPT" | claude --print 2>&1) || true

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "RALPH_COMPLETE"; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Ralph completed all tasks!${NC}"
    echo -e "${GREEN}  Finished at iteration $i of $MAX_ITERATIONS${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    exit 0
  fi

  echo -e "${GREEN}Iteration $i complete. Continuing...${NC}"
  sleep 3
done

echo ""
echo -e "${RED}Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks.${NC}"
echo -e "${YELLOW}Check $PROGRESS_FILE for status.${NC}"
exit 1
