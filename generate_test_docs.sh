#!/bin/bash

# Script to generate and send 500 random documents to Marqo

# Configuration
API_URL="http://localhost:9882/proxy/indexes/test-index/documents"
NUM_DOCS=500
INDEX_NAME="test-index"
BATCH_SIZE=50  # Reduced batch size to avoid "Argument list too long" error

# Array of placeholder texts to generate random content
TEXTS=(
  "Artificial intelligence is transforming how businesses operate across industries."
  "Machine learning algorithms can identify patterns in data that humans might miss."
  "Vector databases are optimized for similarity search operations on embeddings."
  "Neural networks consist of layers of interconnected nodes that process information."
  "Semantic search understands the meaning behind queries rather than just matching keywords."
  "Large language models have billions of parameters that help them understand context."
  "Data preprocessing is a critical step in building effective machine learning models."
  "Cloud computing provides scalable resources for deploying AI applications."
  "Natural language processing enables computers to understand human language."
  "Computer vision systems can identify objects and patterns in images and videos."
)

# Generate a random UUID
generate_uuid() {
  cat /proc/sys/kernel/random/uuid
}

# Generate random content by combining random sentences
generate_content() {
  local length=$((RANDOM % 10 + 5))  # Between 5 and 15 sentences
  local content=""
  
  for ((i=0; i<length; i++)); do
    # Pick a random sentence from our array
    random_index=$((RANDOM % ${#TEXTS[@]}))
    sentence="${TEXTS[$random_index]}"
    
    # Add some random modifiers occasionally
    if [ $((RANDOM % 3)) -eq 0 ]; then
      modifiers=("importantly" "interestingly" "notably" "significantly" "remarkably")
      mod_index=$((RANDOM % ${#modifiers[@]}))
      sentence="Most ${modifiers[$mod_index]}, $sentence"
    fi
    
    content="$content $sentence"
  done
  
  echo "$content"
}

# Generate JSON payload for a batch of documents
generate_batch_payload() {
  local start_idx=$1
  local end_idx=$2
  local docs_json=""
  
  for ((i=start_idx; i<=end_idx; i++)); do
    local uuid=$(generate_uuid)
    local content=$(generate_content)
    
    # Add comma if not the first document
    [ "$docs_json" != "" ] && docs_json="$docs_json,"
    
    # Create document JSON
    docs_json="$docs_json
    {
      \"_id\": \"$uuid\",
      \"text\": \"$content\"
    }"
  done
  
  # Final JSON with all documents in this batch
  echo "{
  \"documents\": [$docs_json
  ],
  \"tensorFields\": [\"text\"]
}"
}

# Send a batch of documents to Marqo
send_batch() {
  local start_idx=$1
  local end_idx=$2
  local batch_num=$3
  local total_batches=$4
  
  echo -e "Generating batch $batch_num/$total_batches (documents $start_idx-$end_idx)..."
  local payload=$(generate_batch_payload $start_idx $end_idx)
  
  echo "Sending batch $batch_num/$total_batches to Marqo..."
  curl --request POST \
    --url "$API_URL" \
    --header 'Content-Type: application/json' \
    --data "$payload"
  
  echo -e "\n"
}

# Main execution
echo "Generating and sending $NUM_DOCS random documents for index $INDEX_NAME in batches of $BATCH_SIZE..."

# Calculate number of batches
TOTAL_BATCHES=$(( (NUM_DOCS + BATCH_SIZE - 1) / BATCH_SIZE ))

# Process each batch
for ((batch=1; batch<=TOTAL_BATCHES; batch++)); do
  # Calculate start and end indices for this batch
  START_IDX=$(( (batch - 1) * BATCH_SIZE + 1 ))
  END_IDX=$(( batch * BATCH_SIZE ))
  
  # Make sure we don't exceed NUM_DOCS
  if [ $END_IDX -gt $NUM_DOCS ]; then
    END_IDX=$NUM_DOCS
  fi
  
  # Send this batch
  send_batch $START_IDX $END_IDX $batch $TOTAL_BATCHES
  
  # Add a small delay between batches
  if [ $batch -lt $TOTAL_BATCHES ]; then
    echo "Waiting a moment before sending next batch..."
    sleep 1
  fi
done

echo -e "All batches sent successfully!"