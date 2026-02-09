/*
Copyright 2025. projectsveltos.io. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package executor

import (
	"fmt"
	"os"
	"strings"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	appsv1alpha1 "gianlucam76/k8s-cleaner/api/v1alpha1"

	logs "github.com/projectsveltos/libsveltos/lib/logsettings"
)

const (
	// Protection annotation that prevents resources from being deleted/updated
	protectionAnnotation = "cleaner.projectsveltos.io/protect"

	// Environment variable for protected namespaces (comma-separated)
	envProtectedNamespaces = "K8S_CLEANER_PROTECTED_NAMESPACES"

	// Environment variable for protected resource kinds (comma-separated)
	envProtectedKinds = "K8S_CLEANER_PROTECTED_KINDS"

	// Default protected namespaces
	defaultProtectedNamespaces = "kube-system,kube-public,kube-node-lease"
)

var (
	protectedNamespaces = make(map[string]bool)
	protectedKinds     = make(map[string]bool)
)

func init() {
	// Initialize protected namespaces from environment or defaults
	namespaces := os.Getenv(envProtectedNamespaces)
	if namespaces == "" {
		namespaces = defaultProtectedNamespaces
	}
	for _, ns := range strings.Split(namespaces, ",") {
		ns = strings.TrimSpace(ns)
		if ns != "" {
			protectedNamespaces[ns] = true
		}
	}

	// Initialize protected kinds from environment
	kinds := os.Getenv(envProtectedKinds)
	for _, kind := range strings.Split(kinds, ",") {
		kind = strings.TrimSpace(kind)
		if kind != "" {
			protectedKinds[kind] = true
		}
	}
}

// ProtectionReason indicates why a resource is protected
type ProtectionReason string

const (
	ProtectionReasonAnnotation ProtectionReason = "annotation"
	ProtectionReasonNamespace  ProtectionReason = "namespace"
	ProtectionReasonKind       ProtectionReason = "kind"
)

// IsResourceProtected checks if a resource is protected from deletion/update
func IsResourceProtected(resource *unstructured.Unstructured, cleanerName string, logger logr.Logger) (bool, ProtectionReason) {
	// Check protection annotation
	if annotations := resource.GetAnnotations(); annotations != nil {
		if val, ok := annotations[protectionAnnotation]; ok && (val == "true" || val == "1") {
			logger.V(logs.LogDebug).Info("resource protected by annotation",
				"resource", fmt.Sprintf("%s/%s/%s", resource.GetKind(), resource.GetNamespace(), resource.GetName()))
			reportProtectedResource(cleanerName, resource.GetAPIVersion(), resource.GetKind(), string(ProtectionReasonAnnotation))
			return true, ProtectionReasonAnnotation
		}
	}

	// Check protected namespace
	namespace := resource.GetNamespace()
	if namespace == "" {
		// Cluster-scoped resource, check if kind is protected
		if protectedKinds[resource.GetKind()] {
			logger.V(logs.LogDebug).Info("cluster-scoped resource protected by kind",
				"kind", resource.GetKind())
			reportProtectedResource(cleanerName, resource.GetAPIVersion(), resource.GetKind(), string(ProtectionReasonKind))
			return true, ProtectionReasonKind
		}
	} else {
		if protectedNamespaces[namespace] {
			logger.V(logs.LogDebug).Info("resource protected by namespace",
				"namespace", namespace)
			reportProtectedResource(cleanerName, resource.GetAPIVersion(), resource.GetKind(), string(ProtectionReasonNamespace))
			return true, ProtectionReasonNamespace
		}
	}

	// Check protected kind
	if protectedKinds[resource.GetKind()] {
		logger.V(logs.LogDebug).Info("resource protected by kind",
			"kind", resource.GetKind())
		reportProtectedResource(cleanerName, resource.GetAPIVersion(), resource.GetKind(), string(ProtectionReasonKind))
		return true, ProtectionReasonKind
	}

	return false, ""
}

// ValidateCleanerAction validates if a cleaner action is allowed
func ValidateCleanerAction(cleaner *appsv1alpha1.Cleaner, logger logr.Logger) error {
	// Check if action is allowed in strict mode
	if strictMode := os.Getenv("K8S_CLEANER_STRICT_MODE"); strictMode == "true" || strictMode == "1" {
		if cleaner.Spec.Action != appsv1alpha1.ActionScan {
			return fmt.Errorf("strict mode enabled: only Scan action is allowed, but cleaner %s has action %s",
				cleaner.Name, cleaner.Spec.Action)
		}
		logger.V(logs.LogInfo).Info("strict mode enabled, only Scan actions allowed")
	}

	return nil
}

// GetProtectedNamespaces returns the list of protected namespaces
func GetProtectedNamespaces() []string {
	result := make([]string, 0, len(protectedNamespaces))
	for ns := range protectedNamespaces {
		result = append(result, ns)
	}
	return result
}

// GetProtectedKinds returns the list of protected resource kinds
func GetProtectedKinds() []string {
	result := make([]string, 0, len(protectedKinds))
	for kind := range protectedKinds {
		result = append(result, kind)
	}
	return result
}

// AddProtectedNamespace adds a namespace to the protected list (runtime)
func AddProtectedNamespace(namespace string) {
	protectedNamespaces[namespace] = true
}

// AddProtectedKind adds a kind to the protected list (runtime)
func AddProtectedKind(kind string) {
	protectedKinds[kind] = true
}

