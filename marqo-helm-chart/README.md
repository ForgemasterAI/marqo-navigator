# Marqo Helm Chart

A Helm chart for deploying Marqo and Vespa components to Kubernetes.

## Installation

Once this chart is published to GitHub Pages, you can install it using the following commands:

```bash
# Add the Helm repository
helm repo add marqo-charts https://[YOUR-GITHUB-USERNAME].github.io/marqo-navigator/

# Update your local Helm chart repository cache
helm repo update

# Install the chart with the release name `my-release`
helm install my-release marqo-charts/marqo-helm-chart
```

## Configuration

The following table lists the configurable parameters of the Marqo chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| ... | ... | ... |

For more configuration options, please see the [values.yaml](values.yaml) file.

## Requirements

* Kubernetes 1.16+
* Helm 3.0+

## Development

### Testing the Chart Locally

```bash
helm install test-release ./marqo-helm-chart --dry-run --debug
```