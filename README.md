# AI Portal Studio

AI Portal Studio is a small collection of interactive tools and simulations.

## Projects

- [Portal Home](https://tioon.github.io/ai-portal-studio/projects/portal-home/)
  - Project launcher and entry point for the studio.
- [vLLM Planner](https://tioon.github.io/ai-portal-studio/projects/vllm-planner/)
  - Recommendation tool for sizing vLLM deployments.
- [AI Server Request](https://tioon.github.io/ai-portal-studio/projects/ai-server-request/)
  - Request generator for on-prem AI server needs.
- [Kubernetes Network Lab](https://tioon.github.io/ai-portal-studio/projects/cka-lab/)
  - Kubernetes lab for building clusters, creating resources, and tracing internal traffic flow.

## Kubernetes Network Lab

The CKA Lab project has been rebuilt as a cluster builder and network tracing lab.

It visualizes:

- Cluster creation and reset
- Namespace and resource creation
- Pod scheduling and Service endpoints
- NetworkPolicy blocking and allowing traffic
- Ingress to Service routing
- PVC binding and storage classes
- kubectl inspection commands

The project lives at `projects/cka-lab/` and is deployed as static assets inside the portal.
