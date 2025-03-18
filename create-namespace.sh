#!/bin/bash
set -e

NAMESPACE="forgemasterai-marqo-infra"

echo "Creating namespace $NAMESPACE..."
kubectl create namespace $NAMESPACE || echo "Namespace $NAMESPACE already exists"

echo "Namespace ready. You can now run:"
echo "helm install marqo ./marqo-helm-chart --namespace $NAMESPACE"
