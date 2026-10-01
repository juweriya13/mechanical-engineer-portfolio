/* =========================================================
   SHOEB KHAN
   MECHANICAL ENGINEER PORTFOLIO
   MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       GLOBAL ELEMENTS
    ===================================================== */

    const root = document.documentElement;
    const themeToggle = document.getElementById("theme-toggle");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelector(".nav-links");


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });

        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
            });

        });

    }


    /* =====================================================
       SECTION NAVIGATION
       Explicitly scroll to the requested section while accounting
       for the fixed navbar height.
    ===================================================== */

    const navbar = document.querySelector(".navbar");

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        const href = link.getAttribute("href");

        if (!href || href === "#" || href.length < 2) {
            return;
        }

        const target = document.querySelector(href);

        if (!target) {
            return;
        }

        link.addEventListener("click", event => {
            event.preventDefault();

            if (navLinks) {
                navLinks.classList.remove("open");
            }

            const navHeight = navbar ? navbar.offsetHeight : 0;
            const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navHeight - 10);

            window.scrollTo({
                top,
                behavior: "smooth"
            });

            history.replaceState(null, "", href);
        });
    });


    /* =====================================================
       THEME TOGGLE
    ===================================================== */

    function setTheme(theme) {

        const light = theme === "light";

        root.style.setProperty(
            "--bg",
            light ? "#f5f7fa" : "#0b0f14"
        );

        root.style.setProperty(
            "--bg2",
            light ? "#ffffff" : "#121821"
        );

        root.style.setProperty(
            "--text",
            light ? "#121821" : "#e8edf3"
        );

        root.style.setProperty(
            "--muted",
            light ? "#5a6878" : "#8b98a8"
        );

        root.style.setProperty(
            "--border",
            light ? "#d8dfe8" : "#243040"
        );

        root.style.setProperty(
            "--shadow",
            light
                ? "rgba(0,0,0,.12)"
                : "rgba(0,0,0,.25)"
        );

        if (themeToggle) {
            themeToggle.textContent =
                light ? "☀" : "◐";
        }

        localStorage.setItem(
            "portfolio-theme",
            theme
        );
    }


    if (themeToggle) {

        const savedTheme =
            localStorage.getItem("portfolio-theme")
            || "dark";

        setTheme(savedTheme);

        themeToggle.addEventListener(
            "click",
            () => {

                const currentTheme =
                    localStorage.getItem(
                        "portfolio-theme"
                    ) || "dark";

                setTheme(
                    currentTheme === "dark"
                        ? "light"
                        : "dark"
                );

            }
        );

    }




    /* =====================================================
       PDF PRESENTATION VIEWER

       Uses PDF.js instead of the browser's native PDF iframe.
       This removes the browser PDF toolbar/editing controls
       and renders each presentation page directly on the site.
    ===================================================== */

    function initializePdfViewer(viewerElement) {

        if (!viewerElement || !window.pdfjsLib) {
            return;
        }

        if (viewerElement.dataset.loaded === "true") {
            return;
        }

        const pdfUrl = viewerElement.dataset.pdf;
        const pagesContainer =
            viewerElement.querySelector(".pdf-pages");
        const status =
            viewerElement.querySelector(".pdf-status");

        if (!pdfUrl || !pagesContainer) {
            return;
        }

        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        window.pdfjsLib
            .getDocument(pdfUrl)
            .promise
            .then(async pdf => {

                if (status) {
                    status.remove();
                }

                pagesContainer.innerHTML = "";

                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

                    const page =
                        await pdf.getPage(pageNumber);

                    const baseViewport =
                        page.getViewport({ scale: 1 });

                    const availableWidth =
                        Math.max(
                            viewerElement.clientWidth - 32,
                            320
                        );

                    const displayScale =
                        availableWidth / baseViewport.width;

                    const renderScale =
                        Math.min(
                            Math.max(displayScale, 0.5),
                            1.8
                        );

                    const viewport =
                        page.getViewport({
                            scale: renderScale
                        });

                    const canvas =
                        document.createElement("canvas");

                    canvas.className = "pdf-page";

                    const context =
                        canvas.getContext("2d", {
                            alpha: false
                        });

                    const devicePixelRatio =
                        Math.min(
                            window.devicePixelRatio || 1,
                            2
                        );

                    canvas.width =
                        Math.floor(
                            viewport.width * devicePixelRatio
                        );

                    canvas.height =
                        Math.floor(
                            viewport.height * devicePixelRatio
                        );

                    canvas.style.width =
                        `${viewport.width}px`;

                    canvas.style.height =
                        `${viewport.height}px`;

                    pagesContainer.appendChild(canvas);

                    await page.render({
                        canvasContext: context,
                        viewport,
                        transform:
                            devicePixelRatio !== 1
                                ? [
                                    devicePixelRatio,
                                    0,
                                    0,
                                    devicePixelRatio,
                                    0,
                                    0
                                ]
                                : null
                    }).promise;

                    /* Yield briefly between pages to keep scrolling responsive. */
                    await new Promise(resolve => {
                        requestAnimationFrame(resolve);
                    });
                }

                viewerElement.dataset.loaded = "true";
            })
            .catch(error => {

                console.error(
                    `Unable to render PDF: ${pdfUrl}`,
                    error
                );

                if (status) {
                    status.remove();
                }

                pagesContainer.innerHTML = `
                    <div class="pdf-error">
                        <strong>Presentation could not be loaded.</strong>
                        Please check that the PDF file exists at:
                        <br>
                        ${pdfUrl}
                    </div>
                `;
            });
    }


    function initializePdfPresentations() {

        const viewers =
            document.querySelectorAll(
                ".presentation-viewer[data-pdf]"
            );

        if (!viewers.length) {
            return;
        }

        if (!window.pdfjsLib) {
            console.error("PDF.js failed to load.");
            return;
        }

        /* Render the first viewer immediately. */
        initializePdfViewer(viewers[0]);

        /* Render the remaining viewers as they approach the viewport. */
        if ("IntersectionObserver" in window) {

            const observer =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(entry => {

                            if (!entry.isIntersecting) {
                                return;
                            }

                            initializePdfViewer(
                                entry.target
                            );

                            observer.unobserve(
                                entry.target
                            );

                        });

                    },
                    {
                        rootMargin: "500px 0px"
                    }
                );

            viewers.forEach(viewerElement => {

                if (viewerElement !== viewers[0]) {
                    observer.observe(viewerElement);
                }

            });

        } else {

            viewers.forEach(
                initializePdfViewer
            );

        }
    }


    initializePdfPresentations();


    /* =====================================================
       3D SHOWCASE
       Client CAD Models

       Only "Assembly Exploded View" is exploded.
       Seal Assembly and Mill Assembly remain assembled.
    ===================================================== */

    const viewer = document.getElementById("model-viewer");
    const modelTabs = document.getElementById("model-tabs");
    const modelInfo = document.getElementById("model-info");

    if (
        viewer &&
        modelTabs &&
        modelInfo &&
        typeof THREE !== "undefined"
    ) {

        const modelData = {
            seal: {
                name: "Seal Assembly",
                file: "assets/models/Seal_Assembly.glb",
                exploded: false
            },
            assembly: {
                name: "Assembly Exploded View",
                file: "assets/models/Assembly.glb",
                exploded: true
            },
            mill: {
                name: "Mill Assembly",
                file: "assets/models/millasm_2.glb",
                exploded: false
            }
        };

        let scene = null;
        let camera = null;
        let renderer = null;
        let controls = null;
        let loader = null;
        let currentModel = null;
        let resizeObserver = null;
        let explosionAnimationFrame = null;
        let loadSequence = 0;

        function setViewerStatus(message, type = "loading") {
            const old = viewer.querySelector(".model-loading, .model-error");
            if (old) old.remove();
            if (!message) return;

            const status = document.createElement("div");
            status.className = type === "error" ? "model-error" : "model-loading";
            status.textContent = message;
            viewer.appendChild(status);
        }

        function updateActiveTab(type) {
            modelTabs.querySelectorAll("button[data-model]").forEach(button => {
                button.classList.toggle("active", button.dataset.model === type);
            });
        }

        function disposeMaterial(material) {
            if (!material) return;
            Object.keys(material).forEach(key => {
                const value = material[key];
                if (value && value.isTexture && typeof value.dispose === "function") {
                    value.dispose();
                }
            });
            if (typeof material.dispose === "function") {
                material.dispose();
            }
        }

        function disposeObject(object) {
            if (!object) return;
            object.traverse(child => {
                if (!child.isMesh) return;
                if (child.geometry) child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(disposeMaterial);
                } else {
                    disposeMaterial(child.material);
                }
            });
        }

        function removeCurrentModel() {
            if (!currentModel || !scene) return;
            scene.remove(currentModel);
            disposeObject(currentModel);
            currentModel = null;
        }

        function normalizeModel(model) {
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDimension = Math.max(size.x, size.y, size.z);

            if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
                throw new Error("The GLB does not contain a valid renderable model.");
            }

            const targetSize = 3.2;
            const scale = targetSize / maxDimension;

            model.scale.setScalar(scale);
            model.position.set(
                -center.x * scale,
                -center.y * scale,
                -center.z * scale
            );

            let meshCount = 0;
            model.traverse(child => {
                if (!child.isMesh) return;
                meshCount += 1;
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    const materials = Array.isArray(child.material)
                        ? child.material
                        : [child.material];
                    materials.forEach(material => {
                        if (material) material.needsUpdate = true;
                    });
                }
            });

            return meshCount;
        }

        function getAssemblyComponents(root) {
            return root.children.filter(child => {
                return child && child.visible !== false;
            });
        }

        function createExplosionData(model) {
            const root = model.getObjectByName("Assembly");

            if (!root) {
                throw new Error(
                    'The "Assembly" node was not found in Assembly.glb.'
                );
            }

            model.updateMatrixWorld(true);

            const assemblyBox = new THREE.Box3().setFromObject(root);
            const assemblyCenter = assemblyBox.getCenter(new THREE.Vector3());
            const components = getAssemblyComponents(root);
            const explosionData = [];

            components.forEach((component, index) => {
                const componentBox = new THREE.Box3().setFromObject(component);
                const componentCenter = componentBox.getCenter(new THREE.Vector3());
                let direction = componentCenter.clone().sub(assemblyCenter);

                if (direction.lengthSq() < 0.000001) {
                    const fallback = [
                        new THREE.Vector3(1, 0, 0),
                        new THREE.Vector3(-1, 0, 0),
                        new THREE.Vector3(0, 1, 0),
                        new THREE.Vector3(0, -1, 0),
                        new THREE.Vector3(0, 0, 1),
                        new THREE.Vector3(0, 0, -1)
                    ];
                    direction.copy(fallback[index % fallback.length]);
                }

                direction.normalize();

                const componentSize = componentBox.getSize(new THREE.Vector3());
                const size = Math.max(
                    componentSize.x,
                    componentSize.y,
                    componentSize.z
                );

                /* A moderate separation keeps the engineering assembly readable. */
                const distance = 0.55 + Math.min(size * 0.25, 0.55);

                const worldStart = component.getWorldPosition(new THREE.Vector3());
                const worldEnd = worldStart.clone().add(
                    direction.multiplyScalar(distance)
                );

                const localEnd = worldEnd.clone();
                if (component.parent) {
                    component.parent.worldToLocal(localEnd);
                }

                explosionData.push({
                    component,
                    start: component.position.clone(),
                    end: localEnd
                });
            });

            return explosionData;
        }

        function animateExplosion(explosionData) {
            if (!explosionData || !explosionData.length) return;

            if (explosionAnimationFrame) {
                cancelAnimationFrame(explosionAnimationFrame);
            }

            explosionData.forEach(item => {
                item.component.position.copy(item.start);
            });

            const startTime = performance.now();
            const duration = 1400;

            function easeOutCubic(value) {
                return 1 - Math.pow(1 - value, 3);
            }

            function step(now) {
                const progress = Math.min(
                    Math.max((now - startTime) / duration, 0),
                    1
                );

                const eased = easeOutCubic(progress);

                explosionData.forEach(item => {
                    item.component.position.lerpVectors(
                        item.start,
                        item.end,
                        eased
                    );
                });

                if (progress < 1) {
                    explosionAnimationFrame = requestAnimationFrame(step);
                } else {
                    explosionAnimationFrame = null;
                }
            }

            explosionAnimationFrame = requestAnimationFrame(step);
        }

        function updateModelInfo(type, componentCount = null) {
            const data = modelData[type];
            if (!data) return;

            const detail = data.exploded && componentCount !== null
                ? `Interactive exploded CAD view · ${componentCount} components`
                : "Interactive 3D CAD model";

            modelInfo.innerHTML = `
                <h3>${data.name}</h3>
                <p>${detail}</p>
            `;
        }

        function loadModel(type) {
            const data = modelData[type];
            if (!data) return;

            updateActiveTab(type);
            updateModelInfo(type);
            setViewerStatus("Loading 3D model…");
            removeCurrentModel();

            const sequence = ++loadSequence;

            loader.load(
                data.file,
                gltf => {
                    if (sequence !== loadSequence) {
                        disposeObject(gltf.scene);
                        return;
                    }

                    try {
                        const meshCount = normalizeModel(gltf.scene);
                        currentModel = gltf.scene;

                        currentModel.rotation.x = 0.18;
                        currentModel.rotation.y = -0.35;

                        scene.add(currentModel);

                        camera.position.set(4.6, 2.8, 4.8);
                        controls.target.set(0, 0, 0);
                        controls.update();

                        if (data.exploded) {
                            const explosionData =
                                createExplosionData(currentModel);

                            updateModelInfo(
                                type,
                                explosionData.length
                            );

                            setViewerStatus(null);
                            animateExplosion(explosionData);
                        } else {
                            updateModelInfo(type, meshCount);
                            setViewerStatus(null);
                        }
                    } catch (error) {
                        console.error("3D model preparation failed:", error);
                        setViewerStatus(
                            "This GLB could not be displayed. Please verify the model structure and file export.",
                            "error"
                        );
                    }
                },
                xhr => {
                    if (xhr && xhr.total > 0) {
                        const percent = Math.round(
                            (xhr.loaded / xhr.total) * 100
                        );
                        setViewerStatus(`Loading 3D model… ${percent}%`);
                    }
                },
                error => {
                    console.error(`Unable to load ${data.file}:`, error);
                    setViewerStatus(
                        `Unable to load ${data.name}. Check the file path: ${data.file}`,
                        "error"
                    );
                }
            );
        }

        try {
            if (typeof THREE.WebGLRenderer !== "function") {
                throw new Error("Three.js WebGLRenderer is unavailable.");
            }
            if (typeof THREE.GLTFLoader === "undefined") {
                throw new Error("GLTFLoader is unavailable.");
            }
            if (typeof THREE.OrbitControls === "undefined") {
                throw new Error("OrbitControls is unavailable.");
            }

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(
                40,
                1,
                0.1,
                100
            );
            camera.position.set(4.6, 2.8, 4.8);

            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });

            renderer.setPixelRatio(
                Math.min(window.devicePixelRatio || 1, 2)
            );
            renderer.setClearColor(0x000000, 0);

            if (
                "outputEncoding" in renderer &&
                typeof THREE.sRGBEncoding !== "undefined"
            ) {
                renderer.outputEncoding = THREE.sRGBEncoding;
            }

            if (
                "toneMapping" in renderer &&
                typeof THREE.ACESFilmicToneMapping !== "undefined"
            ) {
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.05;
            }

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            viewer.appendChild(renderer.domElement);

            scene.add(
                new THREE.HemisphereLight(
                    0xffffff,
                    0x202832,
                    1.25
                )
            );

            const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
            keyLight.position.set(5, 6, 6);
            keyLight.castShadow = true;
            scene.add(keyLight);

            const fillLight = new THREE.DirectionalLight(0xdfe8f2, 1.0);
            fillLight.position.set(-5, 2, 4);
            scene.add(fillLight);

            const rimLight = new THREE.DirectionalLight(0xffc46b, 0.65);
            rimLight.position.set(0, 5, -6);
            scene.add(rimLight);

            controls = new THREE.OrbitControls(
                camera,
                renderer.domElement
            );

            controls.enableDamping = true;
            controls.dampingFactor = 0.07;
            controls.enablePan = false;
            controls.rotateSpeed = 0.7;
            controls.zoomSpeed = 0.8;
            controls.minDistance = 1.8;
            controls.maxDistance = 12;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.6;
            controls.target.set(0, 0, 0);

            loader = new THREE.GLTFLoader();

            function resizeViewer() {
                const width = viewer.clientWidth;
                const height = viewer.clientHeight;
                if (!width || !height) return;

                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }

            if (typeof ResizeObserver !== "undefined") {
                resizeObserver = new ResizeObserver(resizeViewer);
                resizeObserver.observe(viewer);
            } else {
                window.addEventListener("resize", resizeViewer);
            }

            resizeViewer();

            renderer.domElement.addEventListener("pointerdown", () => {
                controls.autoRotate = false;
            });

            renderer.domElement.addEventListener("pointerup", () => {
                controls.autoRotate = true;
            });

            renderer.domElement.addEventListener("pointercancel", () => {
                controls.autoRotate = true;
            });

            modelTabs.addEventListener("click", event => {
                const button = event.target.closest("button[data-model]");
                if (!button) return;
                loadModel(button.dataset.model);
            });

            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }

            animate();

            /* Default tab: Assembly Exploded View */
            loadModel("assembly");

        } catch (error) {
            console.error("3D viewer initialization failed:", error);
            setViewerStatus(
                "3D preview is not available. Check the Three.js addon scripts in index.html.",
                "error"
            );
        }
    }


    /* =====================================================
       KEY PROJECT FILTERS
       Exact filtering behavior from the client-provided project section.
    ===================================================== */

    const projectSection = document.getElementById("projects");

    if (projectSection) {
        const projectPills = projectSection.querySelectorAll(".project-pill");
        const projectCards = [
            ...projectSection.querySelectorAll(".key-project-card")
        ];

        projectPills.forEach(pill => {
            pill.addEventListener("click", () => {
                projectPills.forEach(item => {
                    item.classList.remove("on");
                });

                pill.classList.add("on");

                const filter = pill.dataset.f;

                projectCards.forEach(card => {
                    const tags = card.dataset.tags.split(" ");
                    card.hidden =
                        filter !== "all" &&
                        !tags.includes(filter);
                });
            });
        });
    }


    /* =====================================================
       INITIALIZATION MESSAGE
    ===================================================== */

    console.log(
        "Shoeb Khan Portfolio initialized successfully."
    );

});