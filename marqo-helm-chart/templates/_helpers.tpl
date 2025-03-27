{{/* 
Determine which namespace to use
*/}}
{{- define "marqo.namespace" -}}
{{- if .Values -}}
{{- if .Values.namespace -}}
{{- .Values.namespace -}}
{{- else -}}
{{- .Release.Namespace -}}
{{- end -}}
{{- else if $ -}}
{{- if $.Values -}}
{{- if $.Values.namespace -}}
{{- $.Values.namespace -}}
{{- else -}}
{{- $.Release.Namespace -}}
{{- end -}}
{{- else -}}
{{- $.Release.Namespace -}}
{{- end -}}
{{- else -}}
{{- .Release.Namespace -}}
{{- end -}}
{{- end -}}

{{/* 
Create a fully qualified DNS name for services
*/}}
{{- define "marqo.serviceDnsName" -}}
{{- $service := index . 0 -}}
{{- $namespace := include "marqo.namespace" (index . 1) -}}
{{- printf "%s.%s.svc.cluster.local" $service $namespace -}}
{{- end -}}
