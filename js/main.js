/* =========================================================
   SHOEB KHAN — MECHANICAL ENGINEER PORTFOLIO
   Complete main.js
   - Navigation / mobile menu
   - Theme toggle
   - PDF.js presentation viewers
   - Three.js CAD showcase
   - Controlled royal Assembly exploded view
   - Project filtering
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const root = document.documentElement;
    const navbar = document.querySelector(".navbar");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const themeToggle = document.getElementById("theme-toggle");

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
       SMOOTH SECTION NAVIGATION
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        const href = link.getAttribute("href");

        if (!href || href === "#") {
            return;
        }

        let target;

        try {
            target = document.querySelector(href);
        } catch {
            target = null;
        }

        if (!target) {
            return;
        }

        link.addEventListener("click", event => {

            event.preventDefault();

            if (navLinks) {
                navLinks.classList.remove("open");
            }

            const offset =
                (navbar?.offsetHeight || 0) + 10;

            const top =
                Math.max(
                    0,
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    offset
                );

            window.scrollTo({
                top,
                behavior: "smooth"
            });

            history.replaceState(
                null,
                "",
                href
            );

        });

    });

    /* =====================================================
       THEME
    ===================================================== */

    function setTheme(theme) {

        const light =
            theme === "light";

        root.style.setProperty(
            "--bg",
            light
                ? "#f5f7fa"
                : "#0b0f14"
        );

        root.style.setProperty(
            "--bg2",
            light
                ? "#ffffff"
                : "#121821"
        );

        root.style.setProperty(
            "--text",
            light
                ? "#121821"
                : "#e8edf3"
        );

        root.style.setProperty(
            "--muted",
            light
                ? "#5a6878"
                : "#8b98a8"
        );

        root.style.setProperty(
            "--border",
            light
                ? "#d8dfe8"
                : "#243040"
        );

        root.style.setProperty(
            "--shadow",
            light
                ? "rgba(0,0,0,.12)"
                : "rgba(0,0,0,.25)"
        );

        if (themeToggle) {
            themeToggle.textContent =
                light
                    ? "☀"
                    : "◐";
        }

        localStorage.setItem(
            "portfolio-theme",
            theme
        );

    }

    if (themeToggle) {

        setTheme(
            localStorage.getItem(
                "portfolio-theme"
            ) || "dark"
        );

        themeToggle.addEventListener(
            "click",
            () => {

                const current =
                    localStorage.getItem(
                        "portfolio-theme"
                    ) || "dark";

                setTheme(
                    current === "dark"
                        ? "light"
                        : "dark"
                );

            }
        );

    }

    /* =====================================================
       PDF PRESENTATIONS
    ===================================================== */

    function initializePdfViewer(
        viewerElement
    ) {

        if (
            !viewerElement ||
            !window.pdfjsLib
        ) {
            return;
        }

        if (
            viewerElement.dataset.loaded ===
            "true"
        ) {
            return;
        }

        const pdfUrl =
            viewerElement.dataset.pdf;

        const pagesContainer =
            viewerElement.querySelector(
                ".pdf-pages"
            );

        const status =
            viewerElement.querySelector(
                ".pdf-status"
            );

        if (
            !pdfUrl ||
            !pagesContainer
        ) {
            return;
        }

        window.pdfjsLib
            .GlobalWorkerOptions
            .workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        window.pdfjsLib
            .getDocument(
                pdfUrl
            )
            .promise
            .then(
                async pdf => {

                    if (status) {
                        status.remove();
                    }

                    pagesContainer.innerHTML =
                        "";

                    for (
                        let pageNumber = 1;
                        pageNumber <= pdf.numPages;
                        pageNumber++
                    ) {

                        const page =
                            await pdf.getPage(
                                pageNumber
                            );

                        const baseViewport =
                            page.getViewport({
                                scale: 1
                            });

                        const availableWidth =
                            Math.max(
                                viewerElement.clientWidth -
                                32,
                                320
                            );

                        const scale =
                            Math.min(
                                Math.max(
                                    availableWidth /
                                    baseViewport.width,
                                    0.5
                                ),
                                1.8
                            );

                        const viewport =
                            page.getViewport({
                                scale
                            });

                        const canvas =
                            document.createElement(
                                "canvas"
                            );

                        const ctx =
                            canvas.getContext(
                                "2d",
                                {
                                    alpha: false
                                }
                            );

                        const dpr =
                            Math.min(
                                window.devicePixelRatio ||
                                1,
                                2
                            );

                        canvas.className =
                            "pdf-page";

                        canvas.width =
                            Math.floor(
                                viewport.width *
                                dpr
                            );

                        canvas.height =
                            Math.floor(
                                viewport.height *
                                dpr
                            );

                        canvas.style.width =
                            `${viewport.width}px`;

                        canvas.style.height =
                            `${viewport.height}px`;

                        pagesContainer.appendChild(
                            canvas
                        );

                        await page.render({

                            canvasContext:
                                ctx,

                            viewport,

                            transform:
                                dpr !== 1
                                    ? [
                                        dpr,
                                        0,
                                        0,
                                        dpr,
                                        0,
                                        0
                                    ]
                                    : null

                        }).promise;

                    }

                    viewerElement.dataset.loaded =
                        "true";

                }
            )
            .catch(
                error => {

                    console.error(
                        `Unable to render PDF: ${pdfUrl}`,
                        error
                    );

                    if (status) {
                        status.remove();
                    }

                    pagesContainer.innerHTML = `

                        <div class="pdf-error">

                            <strong>
                                Presentation could not be loaded.
                            </strong>

                            <br>

                            Please check that the PDF exists at:

                            <br>

                            ${pdfUrl}

                        </div>

                    `;

                }
            );

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

            console.error(
                "PDF.js failed to load."
            );

            return;
        }

        initializePdfViewer(
            viewers[0]
        );

        if (
            "IntersectionObserver" in
            window
        ) {

            const observer =
                new IntersectionObserver(

                    entries => {

                        entries.forEach(
                            entry => {

                                if (
                                    !entry.isIntersecting
                                ) {
                                    return;
                                }

                                initializePdfViewer(
                                    entry.target
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }
                        );

                    },

                    {
                        rootMargin:
                            "500px 0px"
                    }

                );

            viewers.forEach(
                (element, index) => {

                    if (index !== 0) {
                        observer.observe(
                            element
                        );
                    }

                }
            );

        } else {

            viewers.forEach(
                initializePdfViewer
            );

        }

    }

    initializePdfPresentations();

    /* =====================================================
       3D SHOWCASE
    ===================================================== */

    const viewer =
        document.getElementById(
            "model-viewer"
        );

    const modelTabs =
        document.getElementById(
            "model-tabs"
        );

    const modelInfo =
        document.getElementById(
            "model-info"
        );

    if (
        !viewer ||
        !modelTabs ||
        !modelInfo ||
        typeof THREE === "undefined"
    ) {

        console.warn(
            "3D viewer elements or Three.js are unavailable."
        );

        initializeProjects();

        return;
    }

    const modelData = {

        assembly: {
            name:
                "Assembly Exploded View",

            file:
                "assets/models/Assembly.glb",

            type:
                "glb",

            exploded:
                true
        },

        seal: {
            name:
                "Seal Assembly",

            file:
                "assets/models/Seal_Assembly.glb",

            type:
                "glb",

            exploded:
                false
        },

        shaftSleeve: {
            name:
                "Shaft Sleeve",

            file:
                "assets/models/6.SHAFT_SLEEVE.glb",

            type:
                "glb",

            exploded:
                false
        },

        secImpeller: {
            name:
                "SEC Impeller",

            file:
                "assets/models/SEC IMPELLER.glb",

            type:
                "glb",

            exploded:
                false
        },

        cardanShaft: {
            name:
                "Cardan Shaft",

            file:
                "assets/models/Cardan Shaft.glb",

            type:
                "glb",

            exploded:
                false
        },

        rubberDuct: {
            name:
                "Rubber Duct",

            file:
                "assets/models/aw_rubber_duct.glb",

            type:
                "glb",

            exploded:
                false
        },

        circularPattern: {
            name:
                "Circular Pattern",

            file:
                "assets/models/Circular Pattern1.sab",

            type:
                "sab",

            exploded:
                false
        },

        roboticArm: {
            name:
                "Robotic Arm Assembly",

            file:
                "assets/models/Robotic_Arm_Assembly.glb",

            type:
                "glb",

            exploded:
                false
        },

        mill: {
            name:
                "Mill Assembly",

            file:
                "assets/models/millasm_2.glb",

            type:
                "glb",

            exploded:
                false
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

    /* =====================================================
       VIEWER STATUS
    ===================================================== */

    function setViewerStatus(
        message,
        type = "loading"
    ) {

        viewer
            .querySelectorAll(
                ".model-loading, .model-error"
            )
            .forEach(
                element =>
                    element.remove()
            );

        if (!message) {
            return;
        }

        const status =
            document.createElement(
                "div"
            );

        status.className =
            type === "error"
                ? "model-error"
                : "model-loading";

        status.textContent =
            message;

        viewer.appendChild(
            status
        );

    }

    /* =====================================================
       ACTIVE MODEL TAB
    ===================================================== */

    function updateActiveTab(
        type
    ) {

        modelTabs
            .querySelectorAll(
                "button[data-model]"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.model ===
                        type
                    );

                }
            );

    }

    /* =====================================================
       DISPOSE MATERIAL
    ===================================================== */

    function disposeMaterial(
        material
    ) {

        if (!material) {
            return;
        }

        Object.keys(material)
            .forEach(
                key => {

                    const value =
                        material[key];

                    if (
                        value?.isTexture &&
                        typeof value.dispose ===
                        "function"
                    ) {

                        value.dispose();

                    }

                }
            );

        if (
            typeof material.dispose ===
            "function"
        ) {

            material.dispose();

        }

    }

    /* =====================================================
       DISPOSE OBJECT
    ===================================================== */

    function disposeObject(
        object
    ) {

        if (!object) {
            return;
        }

        object.traverse(
            child => {

                if (!child.isMesh) {
                    return;
                }

                child.geometry?.dispose();

                if (
                    Array.isArray(
                        child.material
                    )
                ) {

                    child.material.forEach(
                        disposeMaterial
                    );

                } else {

                    disposeMaterial(
                        child.material
                    );

                }

            }
        );

    }

    /* =====================================================
       REMOVE CURRENT MODEL
    ===================================================== */

    function removeCurrentModel() {

        if (
            explosionAnimationFrame
        ) {

            cancelAnimationFrame(
                explosionAnimationFrame
            );

            explosionAnimationFrame =
                null;

        }

        if (!currentModel) {
            return;
        }

        scene.remove(
            currentModel
        );

        disposeObject(
            currentModel
        );

        currentModel =
            null;

    }

    /* =====================================================
       NORMALIZE MODEL
    ===================================================== */

    function normalizeModel(
        model
    ) {

        model.updateMatrixWorld(
            true
        );

        const box =
            new THREE.Box3()
                .setFromObject(
                    model
                );

        const center =
            box.getCenter(
                new THREE.Vector3()
            );

        const size =
            box.getSize(
                new THREE.Vector3()
            );

        const maxDimension =
            Math.max(
                size.x,
                size.y,
                size.z
            );

        if (
            !Number.isFinite(
                maxDimension
            ) ||
            maxDimension <= 0
        ) {

            throw new Error(
                "The GLB does not contain a valid renderable model."
            );

        }

        const targetSize =
            3.2;

        const scale =
            targetSize /
            maxDimension;

        model.scale.setScalar(
            scale
        );

        model.position.set(

            -center.x * scale,

            -center.y * scale,

            -center.z * scale

        );

        model.updateMatrixWorld(
            true
        );

        let meshCount =
            0;

        model.traverse(
            child => {

                if (!child.isMesh) {
                    return;
                }

                meshCount +=
                    1;

                child.castShadow =
                    true;

                child.receiveShadow =
                    true;

                if (child.material) {

                    const materials =
                        Array.isArray(
                            child.material
                        )
                            ? child.material
                            : [
                                child.material
                            ];

                    materials.forEach(
                        material => {

                            if (material) {

                                material.needsUpdate =
                                    true;

                            }

                        }
                    );

                }

            }
        );

        return meshCount;

    }

    /* =====================================================
       CONTROLLED ROYAL EXPLOSION

       This version keeps the Assembly:

       - aligned on the real X axis
       - mechanically readable
       - moderately exploded
       - clean and symmetrical
       - visually premium

       It does NOT scatter components on Y/Z.
    ===================================================== */

    function createExplosionData(
        model
    ) {

        /*
           IMPORTANT:
           explosionData is declared immediately here.
           This permanently fixes the previous
           "explosionData is not defined" runtime error.
        */

        const explosionData =
            [];

        const root =
            model.getObjectByName(
                "Assembly"
            ) || model;

        model.updateMatrixWorld(
            true
        );

        const assemblyBox =
            new THREE.Box3()
                .setFromObject(
                    root
                );

        const assemblyCenter =
            assemblyBox.getCenter(
                new THREE.Vector3()
            );

        /*
           The Assembly is arranged along X.
           Convert the local X direction into world space
           so the explosion follows the actual model orientation.
        */

        const axisWorld =
            new THREE.Vector3(
                1,
                0,
                0
            );

        axisWorld
            .transformDirection(
                root.matrixWorld
            )
            .normalize();

        /*
           Only move direct Assembly children.
        */

        const components =
            root.children.filter(
                child =>
                    child &&
                    child.visible !== false
            );

        /*
           Read each component's position along the
           real assembly axis.
        */

        const items =
            components.map(
                (
                    component,
                    index
                ) => {

                    const box =
                        new THREE.Box3()
                            .setFromObject(
                                component
                            );

                    const center =
                        box.getCenter(
                            new THREE.Vector3()
                        );

                    const relative =
                        center
                            .clone()
                            .sub(
                                assemblyCenter
                            );

                    const signedAxisPosition =
                        relative.dot(
                            axisWorld
                        );

                    return {

                        component,

                        index,

                        signedAxisPosition,

                        start:
                            component.position.clone()

                    };

                }
            );

        /*
           Sort the components from rear to front.
        */

        items.sort(
            (a, b) =>
                a.signedAxisPosition -
                b.signedAxisPosition
        );

        /*
           Group components that occupy almost
           the same axial station.
        */

        const assemblySize =
            assemblyBox.getSize(
                new THREE.Vector3()
            );

        const layerTolerance =
            Math.max(
                assemblySize.length() *
                0.004,
                0.004
            );

        const layers =
            [];

        items.forEach(
            item => {

                const lastLayer =
                    layers[
                        layers.length - 1
                    ];

                if (
                    !lastLayer ||
                    Math.abs(
                        item.signedAxisPosition -
                        lastLayer.center
                    ) >
                    layerTolerance
                ) {

                    layers.push({

                        center:
                            item.signedAxisPosition,

                        items:
                            [item]

                    });

                } else {

                    lastLayer.items.push(
                        item
                    );

                    lastLayer.center =
                        lastLayer.items.reduce(
                            (
                                sum,
                                current
                            ) =>
                                sum +
                                current.signedAxisPosition,
                            0
                        ) /
                        lastLayer.items.length;

                }

            }
        );

        /*
           Find the axial layer closest to the
           centre of the assembly.
        */

        let centerLayer =
            0;

        let smallestDistance =
            Infinity;

        layers.forEach(
            (
                layer,
                index
            ) => {

                const distance =
                    Math.abs(
                        layer.center
                    );

                if (
                    distance <
                    smallestDistance
                ) {

                    smallestDistance =
                        distance;

                    centerLayer =
                        index;

                }

            }
        );

        /*
           EXPLOSION DISTANCES

           Compared with your previous version:

             baseGap = 0.070
             stepGap = 0.065
             max    = 0.42

           This gives a clearly visible but still
           controlled engineering explosion.
        */

        const baseGap =
            0.2;

        const stepGap =
            0.1;

        const maximumGap =
            2.0;

        layers.forEach(
            (
                layer,
                layerIndex
            ) => {

                const side =
                    layerIndex <
                    centerLayer
                        ? 0
                        : layerIndex >
                          centerLayer
                            ? 2
                            : 3;

                const distanceFromCenter =
                    Math.abs(
                        layerIndex -
                        centerLayer
                    );

                const offset =
                    side === 1
                        ? 1
                        : Math.min(
                            baseGap +
                            (
                                distanceFromCenter *
                                stepGap
                            ),
                            maximumGap
                        );

                layer.items.forEach(
                    item => {

                        /*
                           Start in world space.
                        */

                        const startWorld =
                            item.component
                                .getWorldPosition(
                                    new THREE.Vector3()
                                );

                        /*
                           Move ONLY along X-axis.
                        */

                        const endWorld =
                            startWorld
                                .clone()
                                .addScaledVector(
                                    axisWorld,
                                    side *
                                    offset
                                );

                        /*
                           Convert target position
                           back to the component's
                           local coordinate system.
                        */

                        const endLocal =
                            endWorld.clone();

                        if (
                            item.component.parent
                        ) {

                            item.component.parent
                                .worldToLocal(
                                    endLocal
                                );

                        }

                        explosionData.push({

                            component:
                                item.component,

                            start:
                                item.start.clone(),

                            end:
                                endLocal

                        });

                    }
                );

            }
        );

        return explosionData;

    }

    /* =====================================================
       EXPLOSION ANIMATION
    ===================================================== */

    function animateExplosion(
        explosionData
    ) {

        if (
            !explosionData ||
            !explosionData.length
        ) {

            return;

        }

        if (
            explosionAnimationFrame
        ) {

            cancelAnimationFrame(
                explosionAnimationFrame
            );

        }

        explosionData.forEach(
            item => {

                item.component.position.copy(
                    item.start
                );

            }
        );

        const startTime =
            performance.now();

        const duration =
            1550;

        function easeOutCubic(
            value
        ) {

            return (
                1 -
                Math.pow(
                    1 - value,
                    3
                )
            );

        }

        function step(
            now
        ) {

            const progress =
                Math.min(
                    Math.max(
                        (
                            now -
                            startTime
                        ) /
                        duration,
                        0
                    ),
                    1
                );

            const eased =
                easeOutCubic(
                    progress
                );

            explosionData.forEach(
                item => {

                    item.component.position.lerpVectors(

                        item.start,

                        item.end,

                        eased

                    );

                }
            );

            if (
                progress <
                1
            ) {

                explosionAnimationFrame =
                    requestAnimationFrame(
                        step
                    );

            } else {

                explosionAnimationFrame =
                    null;

            }

        }

        explosionAnimationFrame =
            requestAnimationFrame(
                step
            );

    }

    /* =====================================================
       MODEL INFORMATION
    ===================================================== */

    function updateModelInfo(
        type,
        count = null
    ) {

        const data =
            modelData[type];

        if (!data) {
            return;
        }

        const description =
            data.exploded &&
            count !== null

                ? `Interactive exploded CAD view · ${count} components`

                : data.type === "sab"

                    ? "ACIS SAB source file · browser preview requires conversion"

                    : "Interactive 3D CAD model";

        const filename =
            data.file
                .split("/")
                .pop();

        modelInfo.innerHTML = `

            <h3>
                ${data.name}
            </h3>

            <p>
                ${description}
            </p>

            <a
                class="model-file-link"
                href="${encodeURI(data.file)}"
                download
            >
                Source file ·
                ${filename}
            </a>

        `;

    }

    /* =====================================================
       SAB SOURCE-ONLY MODEL
    ===================================================== */

    function showSourceOnlyModel(
        type
    ) {

        const data =
            modelData[type];

        if (!data) {
            return;
        }

        updateActiveTab(
            type
        );

        removeCurrentModel();

        updateModelInfo(
            type
        );

        setViewerStatus(

            "This .sab CAD file is included in the showcase, but Three.js cannot render ACIS SAB directly. Convert it to GLB/GLTF to enable the interactive preview.",

            "error"

        );

    }

    /* =====================================================
       LOAD MODEL
    ===================================================== */

    function loadModel(
        type
    ) {

        const data =
            modelData[type];

        if (!data) {
            return;
        }

        /*
           Three.js GLTFLoader cannot directly
           render ACIS SAB.
        */

        if (
            data.type === "sab"
        ) {

            showSourceOnlyModel(
                type
            );

            return;

        }

        updateActiveTab(
            type
        );

        updateModelInfo(
            type
        );

        setViewerStatus(
            "Loading 3D model…"
        );

        removeCurrentModel();

        const sequence =
            ++loadSequence;

        loader.load(

            data.file,

            gltf => {

                if (
                    sequence !==
                    loadSequence
                ) {

                    disposeObject(
                        gltf.scene
                    );

                    return;

                }

                try {

                    const meshCount =
                        normalizeModel(
                            gltf.scene
                        );

                    currentModel =
                        gltf.scene;

                    /*
                       Original portfolio viewing angle.
                    */

                    currentModel.rotation.x =
                        0.18;

                    currentModel.rotation.y =
                        -0.35;

                    scene.add(
                        currentModel
                    );

                    /*
                       Original camera framing.
                    */

                    camera.position.set(
                        4.6,
                        2.8,
                        4.8
                    );

                    controls.target.set(
                        0,
                        0,
                        0
                    );

                    controls.update();

                    /*
                       Explosion applies ONLY
                       to Assembly.
                    */

                    if (
                        data.exploded
                    ) {

                        const explosionData =
                            createExplosionData(
                                currentModel
                            );

                        updateModelInfo(
                            type,
                            explosionData.length
                        );

                        setViewerStatus(
                            null
                        );

                        animateExplosion(
                            explosionData
                        );

                    } else {

                        updateModelInfo(
                            type,
                            meshCount
                        );

                        setViewerStatus(
                            null
                        );

                    }

                } catch (error) {

                    console.error(
                        "3D model preparation failed:",
                        error
                    );

                    setViewerStatus(

                        "This GLB could not be displayed. Please verify the model structure and file export.",

                        "error"

                    );

                }

            },

            xhr => {

                if (
                    xhr &&
                    xhr.total > 0
                ) {

                    const percent =
                        Math.round(
                            (
                                xhr.loaded /
                                xhr.total
                            ) *
                            100
                        );

                    setViewerStatus(

                        `Loading 3D model… ${percent}%`

                    );

                }

            },

            error => {

                console.error(
                    `Unable to load ${data.file}:`,
                    error
                );

                setViewerStatus(

                    `Unable to load ${data.name}. Check the file path: ${data.file}`,

                    "error"

                );

            }

        );

    }

    /* =====================================================
       THREE.JS INITIALIZATION
    ===================================================== */

    try {

        if (
            typeof THREE.WebGLRenderer !==
            "function"
        ) {

            throw new Error(
                "Three.js WebGLRenderer is unavailable."
            );

        }

        if (
            typeof THREE.GLTFLoader ===
            "undefined"
        ) {

            throw new Error(
                "GLTFLoader is unavailable."
            );

        }

        if (
            typeof THREE.OrbitControls ===
            "undefined"
        ) {

            throw new Error(
                "OrbitControls is unavailable."
            );

        }

        /* =================================================
           SCENE
        ================================================= */

        scene =
            new THREE.Scene();

        /* =================================================
           CAMERA
        ================================================= */

        camera =
            new THREE.PerspectiveCamera(

                40,

                1,

                0.1,

                100

            );

        camera.position.set(
            4.6,
            2.8,
            4.8
        );

        /* =================================================
           RENDERER
        ================================================= */

        renderer =
            new THREE.WebGLRenderer({

                antialias:
                    true,

                alpha:
                    true,

                powerPreference:
                    "high-performance"

            });

        renderer.setPixelRatio(

            Math.min(
                window.devicePixelRatio ||
                1,
                2
            )

        );

        renderer.setClearColor(
            0x000000,
            0
        );

        /*
           Correct GLB color handling.
        */

        if (
            "outputEncoding" in
            renderer &&
            typeof THREE.sRGBEncoding !==
            "undefined"
        ) {

            renderer.outputEncoding =
                THREE.sRGBEncoding;

        }

        /*
           Premium tone mapping.
        */

        if (
            "toneMapping" in
            renderer &&
            typeof THREE.ACESFilmicToneMapping !==
            "undefined"
        ) {

            renderer.toneMapping =
                THREE.ACESFilmicToneMapping;

            renderer.toneMappingExposure =
                1.05;

        }

        renderer.shadowMap.enabled =
            true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        viewer.appendChild(
            renderer.domElement
        );

        /* =================================================
           LIGHTING
        ================================================= */

        scene.add(

            new THREE.HemisphereLight(
                0xffffff,
                0x202832,
                1.25
            )

        );

        const keyLight =
            new THREE.DirectionalLight(
                0xffffff,
                2.0
            );

        keyLight.position.set(
            5,
            6,
            6
        );

        keyLight.castShadow =
            true;

        scene.add(
            keyLight
        );

        const fillLight =
            new THREE.DirectionalLight(
                0xdfe8f2,
                1.0
            );

        fillLight.position.set(
            -5,
            2,
            4
        );

        scene.add(
            fillLight
        );

        const rimLight =
            new THREE.DirectionalLight(
                0xffc46b,
                0.65
            );

        rimLight.position.set(
            0,
            5,
            -6
        );

        scene.add(
            rimLight
        );

        /* =================================================
           ORBIT CONTROLS
        ================================================= */

        controls =
            new THREE.OrbitControls(

                camera,

                renderer.domElement

            );

        controls.enableDamping =
            true;

        controls.dampingFactor =
            0.07;

        controls.enablePan =
            false;

        controls.rotateSpeed =
            0.7;

        controls.zoomSpeed =
            0.8;

        controls.minDistance =
            1.8;

        controls.maxDistance =
            12;

        controls.autoRotate =
            true;

        controls.autoRotateSpeed =
            0.6;

        controls.target.set(
            0,
            0,
            0
        );

        /* =================================================
           GLTF LOADER
        ================================================= */

        loader =
            new THREE.GLTFLoader();

        /* =================================================
           RESPONSIVE VIEWER
        ================================================= */

        function resizeViewer() {

            const width =
                viewer.clientWidth;

            const height =
                viewer.clientHeight;

            if (
                !width ||
                !height
            ) {

                return;

            }

            renderer.setSize(
                width,
                height,
                false
            );

            camera.aspect =
                width /
                height;

            camera.updateProjectionMatrix();

        }

        if (
            typeof ResizeObserver !==
            "undefined"
        ) {

            resizeObserver =
                new ResizeObserver(
                    resizeViewer
                );

            resizeObserver.observe(
                viewer
            );

        } else {

            window.addEventListener(
                "resize",
                resizeViewer
            );

        }

        window.addEventListener(
            "resize",
            resizeViewer
        );

        resizeViewer();

        /* =================================================
           ROTATION BEHAVIOUR
        ================================================= */

        renderer.domElement.addEventListener(
            "pointerdown",
            () => {

                controls.autoRotate =
                    false;

            }
        );

        renderer.domElement.addEventListener(
            "pointerup",
            () => {

                controls.autoRotate =
                    true;

            }
        );

        renderer.domElement.addEventListener(
            "pointercancel",
            () => {

                controls.autoRotate =
                    true;

            }
        );

        /* =================================================
           MODEL TABS
        ================================================= */

        modelTabs.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "button[data-model]"
                    );

                if (!button) {
                    return;
                }

                loadModel(
                    button.dataset.model
                );

            }
        );

        /* =================================================
           RENDER LOOP
        ================================================= */

        function animate() {

            requestAnimationFrame(
                animate
            );

            controls.update();

            renderer.render(
                scene,
                camera
            );

        }

        animate();

        /*
           Default model.
        */

        loadModel(
            "assembly"
        );

    } catch (error) {

        console.error(
            "3D viewer initialization failed:",
            error
        );

        setViewerStatus(

            "3D preview is not available. Check the Three.js addon scripts in index.html.",

            "error"

        );

    }

    /* =====================================================
       PROJECT FILTERS
    ===================================================== */

    function initializeProjects() {

        const projectSection =
            document.getElementById(
                "projects"
            );

        if (!projectSection) {
            return;
        }

        const pills =
            projectSection.querySelectorAll(
                ".project-pill"
            );

        const cards =
            [
                ...projectSection.querySelectorAll(
                    ".key-project-card"
                )
            ];

        pills.forEach(
            pill => {

                pill.addEventListener(
                    "click",
                    () => {

                        pills.forEach(
                            item =>
                                item.classList.remove(
                                    "on"
                                )
                        );

                        pill.classList.add(
                            "on"
                        );

                        const filter =
                            pill.dataset.f ||
                            "all";

                        cards.forEach(
                            card => {

                                const tags =
                                    (
                                        card.dataset.tags ||
                                        ""
                                    )
                                        .split(
                                            /\s+/
                                        );

                                card.hidden =
                                    filter !==
                                    "all" &&
                                    !tags.includes(
                                        filter
                                    );

                            }
                        );

                    }
                );

            }
        );

    }

    initializeProjects();

    /* =====================================================
       NAVIGATION SCROLL SPY
    ===================================================== */

    const sections =
        [
            ...document.querySelectorAll(
                "section[id]"
            )
        ];

    const sectionLinks =
        [
            ...document.querySelectorAll(
                'a[href^="#"]'
            )
        ];

    if (
        sections.length &&
        sectionLinks.length &&
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(

                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }

                            const id =
                                entry.target.id;

                            sectionLinks.forEach(
                                link => {

                                    link.classList.toggle(

                                        "active",

                                        link.getAttribute(
                                            "href"
                                        ) ===
                                        `#${id}`

                                    );

                                }
                            );

                        }
                    );

                },

                {
                    rootMargin:
                        `-${(
                            navbar?.offsetHeight ||
                            0
                        ) + 30}px 0px -55% 0px`,

                    threshold:
                        0

                }

            );

        sections.forEach(
            section =>
                observer.observe(
                    section
                )
        );

    }

    console.log(
        "Shoeb Khan Portfolio initialized successfully."
    );

});