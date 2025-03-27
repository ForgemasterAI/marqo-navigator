# Marqo Helm Chart

A Helm chart for deploying Marqo and Vespa components to Kubernetes.

## Installation

Once this chart is published to GitHub Pages, you can install it using the following commands:

```bash
# Add the Helm repository
helm repo add marqo-charts https://forgemasterai.github.io/marqo-navigator

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
| `opentelemetry.enabled` | Enable OpenTelemetry Collector deployment | `false` |
| `opentelemetry.exporter.endpoint` | OTLP exporter endpoint | `signoz-otel-collector.monitoring.svc.cluster.local:4317` |

For more configuration options, please see the [values.yaml](values.yaml) file.

## Features

### OpenTelemetry Integration

The chart provides optional deployment of an OpenTelemetry Collector that automatically scrapes Vespa metrics.

To enable OpenTelemetry:

```bash
helm install my-release marqo-charts/marqo-helm-chart --set opentelemetry.enabled=true
```

You can customize the OTLP exporter endpoint:

```bash
helm install my-release marqo-charts/marqo-helm-chart \
  --set opentelemetry.enabled=true \
  --set opentelemetry.exporter.endpoint=my-otlp-collector.monitoring:4317
```

## Requirements

* Kubernetes 1.16+
* Helm 3.0+

## Development

### Testing the Chart Locally

```bash
helm install test-release ./marqo-helm-chart --dry-run --debug
```