class CertificateGenerator {
    constructor() {
        this.templateImage = null;
        this.draggableElements = [];
        this.isDragging = false;
        this.dragElement = null;
        this.offset = { x: 0, y: 0 };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload
        const templateInput = document.getElementById('templateInput');
        const uploadArea = document.getElementById('uploadArea');
        
        templateInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        uploadArea.addEventListener('click', () => templateInput.click());
        
        // Form controls
        document.getElementById('nameInput').addEventListener('input', () => this.updateTextContent());
        document.getElementById('usnInput').addEventListener('input', () => this.updateTextContent());
        document.getElementById('fontSize').addEventListener('input', (e) => this.updateFontSize(e));
        document.getElementById('fontColor').addEventListener('input', (e) => this.updateFontColor(e));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.templateImage = e.target.result;
            this.displayTemplate();
            this.showFileInfo(file.name);
            this.enableDownload();
        };
        reader.readAsDataURL(file);
    }

    displayTemplate() {
        const container = document.getElementById('certificateContainer');
        container.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = this.templateImage;
        img.className = 'certificate-image';
        img.id = 'certificateImage';
        
        container.appendChild(img);
        
        // Add draggable text elements
        this.addDraggableText('name', document.getElementById('nameInput').value);
        this.addDraggableText('usn', document.getElementById('usnInput').value);
    }

    addDraggableText(type, text) {
        const container = document.getElementById('certificateContainer');
        const textElement = document.createElement('div');
        textElement.className = 'draggable-text';
        textElement.id = `draggable-${type}`;
        textElement.textContent = text;
        textElement.draggable = true;
        
        // Position elements
        if (type === 'name') {
            textElement.style.left = '50%';
            textElement.style.top = '60%';
            textElement.style.transform = 'translate(-50%, -50%)';
        } else if (type === 'usn') {
            textElement.style.left = '50%';
            textElement.style.top = '70%';
            textElement.style.transform = 'translate(-50%, -50%)';
        }
        
        // Add drag event listeners
        textElement.addEventListener('mousedown', (e) => this.startDrag(e, textElement));
        textElement.addEventListener('dragstart', (e) => e.preventDefault());
        
        container.appendChild(textElement);
        this.draggableElements.push(textElement);
    }

    startDrag(e, element) {
        this.isDragging = true;
        this.dragElement = element;
        element.classList.add('dragging');
        
        const rect = element.getBoundingClientRect();
        const containerRect = document.getElementById('certificateContainer').getBoundingClientRect();
        
        this.offset.x = e.clientX - rect.left;
        this.offset.y = e.clientY - rect.top;
        
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
    }

    handleDrag(e) {
        if (!this.isDragging || !this.dragElement) return;
        
        const container = document.getElementById('certificateContainer');
        const containerRect = container.getBoundingClientRect();
        
        let x = e.clientX - containerRect.left - this.offset.x;
        let y = e.clientY - containerRect.top - this.offset.y;
        
        // Constrain to container bounds
        const elementRect = this.dragElement.getBoundingClientRect();
        const maxX = containerRect.width - elementRect.width;
        const maxY = containerRect.height - elementRect.height;
        
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        this.dragElement.style.left = x + 'px';
        this.dragElement.style.top = y + 'px';
        this.dragElement.style.transform = 'none';
    }

    stopDrag() {
        if (this.dragElement) {
            this.dragElement.classList.remove('dragging');
            this.dragElement = null;
        }
        this.isDragging = false;
        
        document.removeEventListener('mousemove', this.handleDrag.bind(this));
        document.removeEventListener('mouseup', this.stopDrag.bind(this));
    }

    updateTextContent() {
        const nameElement = document.getElementById('draggable-name');
        const usnElement = document.getElementById('draggable-usn');
        
        if (nameElement) {
            nameElement.textContent = document.getElementById('nameInput').value;
        }
        if (usnElement) {
            usnElement.textContent = document.getElementById('usnInput').value;
        }
    }

    updateFontSize(e) {
        const fontSize = e.target.value;
        document.getElementById('fontSizeValue').textContent = fontSize + 'px';
        
        this.draggableElements.forEach(element => {
            element.style.fontSize = fontSize + 'px';
        });
    }

    updateFontColor(e) {
        const color = e.target.value;
        this.draggableElements.forEach(element => {
            element.style.color = color;
        });
    }

    showFileInfo(fileName) {
        document.getElementById('fileName').textContent = fileName;
        document.getElementById('fileInfo').style.display = 'flex';
        document.getElementById('uploadArea').style.display = 'none';
    }

    enableDownload() {
        document.getElementById('downloadBtn').disabled = false;
    }

    removeTemplate() {
        this.templateImage = null;
        document.getElementById('certificateContainer').innerHTML = '<div class="placeholder"><p>Upload a template to see preview</p></div>';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('downloadBtn').disabled = true;
        this.draggableElements = [];
    }

    resetCertificate() {
        document.getElementById('nameInput').value = 'John Doe';
        document.getElementById('usnInput').value = '12345';
        document.getElementById('fontSize').value = 24;
        document.getElementById('fontSizeValue').textContent = '24px';
        document.getElementById('fontColor').value = '#000000';
        
        this.updateTextContent();
        this.updateFontSize({ target: { value: 24 } });
        this.updateFontColor({ target: { value: '#000000' } });
        
        // Reset positions
        const nameElement = document.getElementById('draggable-name');
        const usnElement = document.getElementById('draggable-usn');
        
        if (nameElement) {
            nameElement.style.left = '50%';
            nameElement.style.top = '60%';
            nameElement.style.transform = 'translate(-50%, -50%)';
        }
        if (usnElement) {
            usnElement.style.left = '50%';
            usnElement.style.top = '70%';
            usnElement.style.transform = 'translate(-50%, -50%)';
        }
    }

    async downloadCertificate() {
        if (!this.templateImage) {
            alert('Please upload a template first.');
            return;
        }

        const container = document.getElementById('certificateContainer');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match the image
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw the template image
            ctx.drawImage(img, 0, 0);
            
            // Draw the text elements
            this.draggableElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                
                // Calculate position relative to the image
                const x = (rect.left - containerRect.left) * (img.width / containerRect.width);
                const y = (rect.top - containerRect.top) * (img.height / containerRect.height);
                
                ctx.font = `${element.style.fontSize || '24px'} Arial`;
                ctx.fillStyle = element.style.color || '#000000';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                
                ctx.fillText(element.textContent, x, y);
            });
            
            // Download the image
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'certificate.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        };
        
        img.src = this.templateImage;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CertificateGenerator();
});

// Global functions for HTML onclick handlers
function removeTemplate() {
    if (window.certificateGenerator) {
        window.certificateGenerator.removeTemplate();
    }
}

function downloadCertificate() {
    if (window.certificateGenerator) {
        window.certificateGenerator.downloadCertificate();
    }
}

function resetCertificate() {
    if (window.certificateGenerator) {
        window.certificateGenerator.resetCertificate();
    }
}

// Make the generator globally accessible
window.addEventListener('load', () => {
    window.certificateGenerator = new CertificateGenerator();
});
