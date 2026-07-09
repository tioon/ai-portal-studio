# AI Portal Studio

AI Portal Studio is a small collection of interactive tools and simulations.

## Projects

- [Portal Home](https://tioon.github.io/ai-portal-studio/projects/portal-home/)
  - Project launcher and entry point for the studio.
- [vLLM Planner](https://tioon.github.io/ai-portal-studio/projects/vllm-planner/)
  - Recommendation tool for sizing vLLM deployments.
- [AI Server Request](https://tioon.github.io/ai-portal-studio/projects/ai-server-request/)
  - Request generator for on-prem AI server needs.
- [CKA Concept Atlas](https://tioon.github.io/ai-portal-studio/projects/cka-lab/)
  - Visual concept map for understanding Kubernetes fundamentals, workloads, networking, storage, and security.
- [Linux Ops Manual](https://tioon.github.io/ai-portal-studio/projects/linux-ops-manual/)
  - Rocky Linux and Ubuntu command cheat sheet for server development and operations.

## CKA Concept Atlas

The CKA Lab project has been rebuilt as a concept-first learning atlas.

It focuses on:

- Cluster, Namespace, Control Plane, and Node
- Pod, Deployment, DaemonSet, and StatefulSet
- Service, Ingress, and NetworkPolicy
- ConfigMap, Secret, and PVC
- RBAC, Taint/Toleration, and Probe

The project lives at `projects/cka-lab/` and is deployed as static assets inside the portal.

## Linux Ops Manual

The Linux Ops Manual project is a distro-aware command reference for everyday server work.

It focuses on:

- Rocky Linux and Ubuntu tabs
- Common commands such as `ls`, `find`, `df`, `du`, `journalctl`, `systemctl`, `ss`, `ip`, `curl`, `ssh`, `tar`, and `rsync`
- Per-command options, examples, and warning notes
- Fast search for operational situations like disk pressure, service restarts, port checks, and log tracing

The project lives at `projects/linux-ops-manual/` and is deployed as a static page inside the portal.
