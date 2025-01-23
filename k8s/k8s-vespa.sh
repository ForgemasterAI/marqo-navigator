#!/usr/bin/env sh
set -e

# Find script directory in a POSIX-compatible way
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Creating namespace..."
kubectl apply -f vespa.namespace.yaml

echo "🚀 Deploying config server..."
kubectl apply -f vespa.config-server.yaml
echo "⏳ Waiting for config server..."
kubectl wait --for=condition=ready pod -l app=vespa-configserver -n vector-storage --timeout=300s

echo "🚀 Deploying Vespa components..."
kubectl apply -f vespa.admin-server.yaml
echo "⏳ Waiting for admin server..."

kubectl wait --for=condition=ready pod -l app=vespa-admin-server -n vector-storage --timeout=300s

echo "⏳ Waiting for content server..."
kubectl apply -f vespa.content-server.yaml
kubectl wait --for=condition=ContainersReady pod -l app=vespa-content-server -n vector-storage --timeout=300s
echo "⏳ Waiting for vespa services to get up and running..."
sleep 30
echo "✅ Vespa content-server pods are deployed!"
echo "🚀 Deploying Marqo Navigator"
kubectl apply -f marqo-navigator.deployment.yaml
kubectl wait --for=condition=ready pod -l app=marqo-navigator -n vector-storage --timeout=300s

echo "Do you want to deploy the Marqo app schema to Vespa? (y/n)"
read deploy_marqo
if [ "$deploy_marqo" = "y" ] || [ "$deploy_marqo" = "Y" ]; then
  echo "📦 Deploying Marqo app schema to Vespa..."
  ( cd marqo_app_template && zip -r ../app.zip . )

  kubectl -n vector-storage port-forward pod/vespa-configserver-0 8973:19071 &
  PORT_FORWARD_PID=$!

  sleep 5

  echo "🔗 Uploading schema package..."
  curl --header Content-Type:application/zip --data-binary @app.zip localhost:8973/application/v2/tenant/default/prepareandactivate

  kill "$PORT_FORWARD_PID"
  echo "✅ Marqo app schema deployment complete!"
fi

echo "Do you want to deploy the Node.js development server for proxy debugging? (y/n)"
read deploy_node
if [ "$deploy_node" = "y" ] || [ "$deploy_node" = "Y" ]; then
  echo "🚀 Deploying Node.js development server..."
  kubectl apply -f node.development.yaml
fi

echo "🚀 Deploying Marqo..."
kubectl apply -f marqo.deployment.yaml
kubectl wait --for=condition=ready pod -l app=marqo -n vector-storage --timeout=300s
echo "✅ Deployment complete!"