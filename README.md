# AI Portal Studio

AI Portal Studio is a small collection of interactive tools and simulations.

## Projects

- [Portal Home](https://tioon.github.io/ai-portal-studio/projects/portal-home/)
  - Project launcher and entry point for the studio.
- [vLLM Planner](https://tioon.github.io/ai-portal-studio/projects/vllm-planner/)
  - Recommendation tool for sizing vLLM deployments.
- [AI Server Request](https://tioon.github.io/ai-portal-studio/projects/ai-server-request/)
  - Request generator for on-prem AI server needs.
- [CKA Lab Simulator](https://tioon.github.io/ai-portal-studio/projects/cka-lab/)
  - Kubernetes 3D simulator for control plane, worker nodes, pods, services, storage, RBAC, and GPU scheduling.

## CKA Lab Simulator

The CKA Lab project has been rebuilt as a 3D Kubernetes simulator.

It visualizes:

- Control plane behavior
- Pod lifecycle and scheduling
- Service selector and endpoint flow
- PVC binding and storage classes
- RBAC permissions and `kubectl auth can-i`
- GPU node placement

The project lives at `projects/cka-lab/` and is deployed as static assets inside the portal.
