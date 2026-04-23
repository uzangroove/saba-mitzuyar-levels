#!/usr/bin/env python3
"""
generate_pdfs.py — Auto-generate individual PDFs for each source file
Uses reportlab to create professional PDFs

Installation:
    pip install reportlab pygments requests

Usage:
    python generate_pdfs.py --repo uzangroove/saba-mitzuyar-levels --output ./pdfs
"""

import os
import sys
import json
import argparse
import requests
from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT

class PDFGenerator:
    """Generate syntax-highlighted PDFs from source code files."""
    
    def __init__(self, repo: str, output_dir: str = "./pdfs"):
        self.repo = repo
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.github_api = f"https://api.github.com/repos/{repo}"
        self.github_web = f"https://github.com/{repo}"
        
    def fetch_file_content(self, file_path: str):
        """Fetch file content from GitHub API."""
        url = f"{self.github_api}/contents/{file_path}"
        headers = {"Accept": "application/vnd.github.v3.raw"}
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            content = response.text
            return content
        except requests.RequestException as e:
            print(f"❌ Error fetching {file_path}: {e}")
            return ""
    
    def generate_pdf(self, file_path: str, title: str = None):
        """Generate a single PDF for a source file."""
        print(f"📄 Processing {file_path}...")
        
        content = self.fetch_file_content(file_path)
        if not content:
            print(f"⚠️ Skipping {file_path} - no content")
            return False
        
        title = title or Path(file_path).name
        output_file = self.output_dir / f"{Path(file_path).stem}.pdf"
        
        try:
            doc = SimpleDocTemplate(
                str(output_file),
                pagesize=letter,
                topMargin=0.5*inch,
                bottomMargin=0.5*inch,
                leftMargin=0.5*inch,
                rightMargin=0.5*inch,
            )
            
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                textColor=colors.HexColor('#1a1a2e'),
                spaceAfter=6,
            )
            
            meta_style = ParagraphStyle(
                'Meta',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.HexColor('#666666'),
                spaceAfter=12,
                fontName='Courier',
            )
            
            code_style = ParagraphStyle(
                'Code',
                parent=styles['Normal'],
                fontSize=7,
                fontName='Courier',
                leftIndent=12,
                spaceAfter=2,
                textColor=colors.HexColor('#000000'),
            )
            
            elements = []
            
            # Title
            elements.append(Paragraph(f"📄 {title}", title_style))
            
            # Metadata
            meta_text = (
                f"<b>File:</b> {file_path}<br/>"
                f"<b>Repository:</b> {self.repo}<br/>"
                f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/>"
                f"<b>Lines of Code:</b> {len(content.splitlines())}"
            )
            elements.append(Paragraph(meta_text, meta_style))
            elements.append(Spacer(1, 0.2*inch))
            
            # Code content - SIMPLIFIED
            lines = content.splitlines()
            
            for i, line in enumerate(lines, 1):
                # Simple line formatting
                line_escaped = (
                    line.replace('&', '&amp;')
                        .replace('<', '&lt;')
                        .replace('>', '&gt;')
                )
                line_num = str(i).rjust(4)
                
                # Format: "1234 | code content"
                code_text = f"{line_num} | {line_escaped}"
                elements.append(Paragraph(code_text, code_style))
                
                # Add page break every 60 lines
                if i % 60 == 0 and i < len(lines):
                    elements.append(PageBreak())
            
            # Footer
            elements.append(Spacer(1, 0.2*inch))
            footer_text = f"<font size=8>Source: {self.github_web}/blob/main/{file_path}</font>"
            elements.append(Paragraph(footer_text, meta_style))
            
            # Build PDF
            doc.build(elements)
            print(f"✅ Generated: {output_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error generating PDF for {file_path}: {e}")
            return False
    
    def generate_all_pdfs(self, file_list):
        """Generate PDFs for multiple files."""
        print(f"\n🎬 Starting PDF generation for {len(file_list)} files...\n")
        
        success_count = 0
        for file_path in file_list:
            if self.generate_pdf(file_path):
                success_count += 1
        
        print(f"\n✨ COMPLETE! Generated {success_count}/{len(file_list)} PDFs")
        print(f"📁 Output folder: {self.output_dir.absolute()}")


def main():
    parser = argparse.ArgumentParser(description="Generate PDFs from GitHub source files")
    parser.add_argument("--repo", default="uzangroove/saba-mitzuyar-levels", help="GitHub repo (owner/repo)")
    parser.add_argument("--output", default="./pdfs", help="Output directory for PDFs")
    
    args = parser.parse_args()
    
    # File list for Saba Mitzuyar
    FILES = [
        "src/main.ts",
        "src/GameAPI.ts",
        "src/style.css",
        "src/constants/physics.ts",
        "src/constants/palettes.ts",
        "src/worlds/WorldConfig.ts",
        "src/systems/InputManager.ts",
        "src/systems/SaveManager.ts",
        "src/entities/Player.ts",
        "src/entities/Enemy.ts",
        "src/entities/EnemyRenderer.ts",
        "src/entities/Boss.ts",
        "src/entities/QuailCompanion.ts",
        "src/scenes/BootScene.ts",
        "src/scenes/IntroScene.ts",
        "src/scenes/MainMenuScene.ts",
        "src/scenes/GameScene.ts",
        "src/scenes/HUDScene.ts",
        "src/scenes/LevelSelectScene.ts",
        "src/scenes/SettingsScene.ts",
        "src/scenes/TransitionScene.ts",
        "src/levels/LevelRegistry.ts",
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "index.html",
    ]
    
    generator = PDFGenerator(args.repo, args.output)
    generator.generate_all_pdfs(FILES)


if __name__ == "__main__":
    main()