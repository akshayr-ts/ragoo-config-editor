// Ragoo Pipeline Configuration Editor
// GitHub API integration for updating pipeline-config.json

class PipelineConfigEditor {
	constructor() {
		this.githubToken = "";
		this.owner = "akshayr-ts";
		this.repo = "PUBLIC-CONFIG-RagooExt";
		this.branch = "main";
		this.filePath = "pipeline-config.json";
		this.currentConfig = null;
		this.currentSha = null;

		this.initializeEventListeners();
		this.setupSortable();
	}

	initializeEventListeners() {
		document
			.getElementById("loadConfig")
			.addEventListener("click", () => this.loadConfiguration());
		document
			.getElementById("addStage")
			.addEventListener("click", () => this.addNewStage());
		document
			.getElementById("saveConfig")
			.addEventListener("click", () => this.saveConfiguration());

		// Handle GitHub token storage
		const savedToken = localStorage.getItem("github_token");
		if (savedToken) {
			document.getElementById("githubToken").value = savedToken;
		}
	}

	setupSortable() {
		const container = document.getElementById("stagesContainer");
		new Sortable(container, {
			handle: ".drag-handle",
			animation: 150,
			onEnd: () => this.updatePreview(),
		});
	}

	async loadConfiguration() {
		const token = document.getElementById("githubToken").value.trim();
		if (!token) {
			alert("Please enter your GitHub Personal Access Token");
			return;
		}

		this.githubToken = token;
		localStorage.setItem("github_token", token);

		this.showLoading(true);

		try {
			const response = await fetch(
				`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}?ref=${this.branch}`,
				{
					headers: {
						Authorization: `token ${this.githubToken}`,
						Accept: "application/vnd.github.v3+json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`GitHub API error: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();
			this.currentSha = data.sha;

			// Decode base64 content
			const content = atob(data.content);
			this.currentConfig = JSON.parse(content);

			this.renderStages();
			this.showEditor();
			this.updatePreview();
		} catch (error) {
			console.error("Error loading configuration:", error);
			alert(`Failed to load configuration: ${error.message}`);
		} finally {
			this.showLoading(false);
		}
	}

	renderStages() {
		const container = document.getElementById("stagesContainer");
		container.innerHTML = "";

		this.currentConfig.pipeline.stages.forEach((stage) => {
			const stageElement = this.createStageElement(stage);
			container.appendChild(stageElement);
		});
	}

	createStageElement(stage = null) {
		const template = document.getElementById("stageTemplate");
		const stageElement = template.content.cloneNode(true);

		if (stage) {
			stageElement.querySelector(".stage-label").value = stage.label || "";
			stageElement.querySelector(".stage-value").value = stage.value || "";
			stageElement.querySelector(".stage-badge").value = stage.badgeClass || "";
			stageElement.querySelector(".stage-background").value =
				stage.background || "#6b7280";
		}

		// Setup event listeners for this stage
		const stageDiv = stageElement.querySelector(".stage-card");

		// Color picker events
		stageElement.querySelectorAll(".color-option").forEach((colorOption) => {
			colorOption.addEventListener("click", (e) => {
				const color = e.target.dataset.color;
				const backgroundInput = stageDiv.querySelector(".stage-background");
				backgroundInput.value = color;
				this.updateStagePreview(stageDiv);
				this.updatePreview();
			});
		});

		// Input change events
		stageElement.querySelectorAll("input").forEach((input) => {
			input.addEventListener("input", () => {
				this.updateStagePreview(stageDiv);
				this.updatePreview();
			});
		});

		// Delete button
		stageElement
			.querySelector(".delete-stage")
			.addEventListener("click", () => {
				if (confirm("Are you sure you want to delete this stage?")) {
					stageDiv.remove();
					this.updatePreview();
				}
			});

		// Initial preview update
		setTimeout(() => this.updateStagePreview(stageDiv), 100);

		return stageElement;
	}

	updateStagePreview(stageDiv) {
		const label = stageDiv.querySelector(".stage-label").value || "Preview";
		const background =
			stageDiv.querySelector(".stage-background").value || "#6b7280";
		const preview = stageDiv.querySelector(".stage-preview");

		preview.textContent = label;
		preview.style.backgroundColor = background;
		preview.style.color = this.getContrastColor(background);
	}

	getContrastColor(hexColor) {
		// Convert hex to RGB
		const r = parseInt(hexColor.slice(1, 3), 16);
		const g = parseInt(hexColor.slice(3, 5), 16);
		const b = parseInt(hexColor.slice(5, 7), 16);

		// Calculate luminance
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

		return luminance > 0.5 ? "#000000" : "#ffffff";
	}

	addNewStage() {
		const container = document.getElementById("stagesContainer");
		const newStage = this.createStageElement();
		container.appendChild(newStage);

		// Scroll to the new stage
		newStage.querySelector(".stage-card").scrollIntoView({
			behavior: "smooth",
			block: "center",
		});

		// Focus on the label input
		setTimeout(() => {
			newStage.querySelector(".stage-label").focus();
		}, 300);
	}

	updatePreview() {
		const stages = this.collectStagesData();
		const previewContainer = document.getElementById("previewContainer");

		previewContainer.innerHTML = "<h6>Dropdown Preview:</h6>";
		const dropdown = document.createElement("select");
		dropdown.className = "form-select";
		dropdown.style.maxWidth = "300px";

		// Add default option
		const defaultOption = document.createElement("option");
		defaultOption.textContent = "Current: NA";
		defaultOption.disabled = true;
		dropdown.appendChild(defaultOption);

		stages.forEach((stage) => {
			const option = document.createElement("option");
			option.value = stage.value;
			option.textContent = stage.label;
			option.style.backgroundColor = stage.background;
			option.style.color = this.getContrastColor(stage.background);
			dropdown.appendChild(option);
		});

		previewContainer.appendChild(dropdown);

		// Add badges preview
		const badgesDiv = document.createElement("div");
		badgesDiv.innerHTML = '<h6 class="mt-3">Badges Preview:</h6>';
		stages.forEach((stage) => {
			const badge = document.createElement("span");
			badge.className = `badge me-2 ${stage.badgeClass}`;
			badge.style.backgroundColor = stage.background;
			badge.style.color = this.getContrastColor(stage.background);
			badge.textContent = stage.label;
			badgesDiv.appendChild(badge);
		});
		previewContainer.appendChild(badgesDiv);
	}

	collectStagesData() {
		const stages = [];
		const stageCards = document.querySelectorAll(".stage-card");

		stageCards.forEach((card) => {
			const label = card.querySelector(".stage-label").value.trim();
			const value = card.querySelector(".stage-value").value.trim();
			const badgeClass = card.querySelector(".stage-badge").value.trim();
			const background = card.querySelector(".stage-background").value;

			if (label && value) {
				stages.push({
					label,
					value,
					badgeClass: badgeClass || "badge-secondary",
					background,
				});
			}
		});

		return stages;
	}

	async saveConfiguration() {
		if (
			!confirm(
				"Are you sure you want to save these changes? This will update the live configuration."
			)
		) {
			return;
		}

		this.showLoading(true);

		try {
			const stages = this.collectStagesData();

			if (stages.length === 0) {
				alert("Please add at least one stage before saving.");
				return;
			}

			// Update the configuration object
			const updatedConfig = {
				...this.currentConfig,
				pipeline: {
					...this.currentConfig.pipeline,
					stages: stages,
				},
			};

			// Convert to base64
			const content = btoa(JSON.stringify(updatedConfig, null, 2));

			// Commit to GitHub
			const response = await fetch(
				`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}`,
				{
					method: "PUT",
					headers: {
						Authorization: `token ${this.githubToken}`,
						Accept: "application/vnd.github.v3+json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						message: `Update pipeline configuration - ${new Date().toISOString()}`,
						content: content,
						sha: this.currentSha,
						branch: this.branch,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(
					`GitHub API error: ${response.status} ${response.statusText}`
				);
			}

			const result = await response.json();
			this.currentSha = result.content.sha;
			this.currentConfig = updatedConfig;

			alert(
				"Configuration saved successfully! Changes will be live within a few minutes."
			);
		} catch (error) {
			console.error("Error saving configuration:", error);
			alert(`Failed to save configuration: ${error.message}`);
		} finally {
			this.showLoading(false);
		}
	}

	showEditor() {
		document.getElementById("authSection").style.display = "none";
		document.getElementById("editorSection").style.display = "block";
	}

	showLoading(show) {
		document.getElementById("loadingOverlay").style.display = show
			? "flex"
			: "none";
	}
}

// Initialize the editor when the page loads
document.addEventListener("DOMContentLoaded", () => {
	new PipelineConfigEditor();
});

// Prevent accidental page refresh
window.addEventListener("beforeunload", (e) => {
	const stages = document.querySelectorAll(".stage-card");
	if (stages.length > 0) {
		e.preventDefault();
		e.returnValue = "";
	}
});
