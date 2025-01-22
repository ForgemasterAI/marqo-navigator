#!/bin/bash
set -e

echo "🚀 Creating namespace..."
kubectl apply -f vespa.namespace.yaml

echo "🚀 Deploying config server..."
kubectl apply -f vespa.config-server.yaml
echo "⏳ Waiting for config server..."
kubectl wait --for=condition=ready pod -l app=vespa-configserver -n vector-storage --timeout=300s

echo "🚀 Deploying Vespa components..."
kubectl apply -f vespa.admin-server.yaml
kubectl apply -f vespa.content-server.yaml
kubectl apply -f vespa.feed-server.yaml
kubectl apply -f vespa.query-server.yaml

echo "⏳ Waiting for Vespa components..."
kubectl wait --for=condition=ready pod -l app=vespa-admin-server -n vector-storage --timeout=300s
kubectl wait --for=condition=ready pod -l app=vespa-content-server -n vector-storage --timeout=300s
kubectl wait --for=condition=ready pod -l app=vespa-feed-server -n vector-storage --timeout=300s
kubectl wait --for=condition=ready pod -l app=vespa-query-server -n vector-storage --timeout=300s

echo "📦 Deploying Marqo app schema to Vespa..."
(cd marqo_app_template/ && zip -r ../app.zip .)
# install the marqo app from k8s/marqo_app_template
curl --header Content-Type:application/zip --data-binary @app.zip localhost:8090/application/v2/tenant/default/prepareandactivate

echo "\n✅ Vespa deployment complete! \n"

read -p "Do you want to deploy the Node.js development server? (y/n): " deploy_node
if [ "$deploy_node" = "y" ] || [ "$deploy_node" = "Y" ]; then
  echo "🚀 Deploying Node.js development server..."
  kubectl apply -f node.development.yaml
fi

echo "🚀 Deploying Marqo..."
kubectl apply -f marqo.deployment.yaml
# wait for the marqo deployment to be ready
kubectl wait --for=condition=ready pod -l app=marqo -n vector-storage --timeout=300s

echo "✅ Deployment complete!"