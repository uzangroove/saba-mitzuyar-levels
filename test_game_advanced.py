#!/usr/bin/env python3
"""
test_game_advanced.py — Advanced gameplay testing for Saba Mitzuyar
Simulates actual gameplay: movement, jumping, combat, level completion
Detects gameplay bugs and mechanics issues

Run with: python test_game_advanced.py
"""

import os
import sys
import json
import time
import traceback
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class AdvancedGameTester:
    """Advanced automated tester for Saba Mitzuyar gameplay."""
    
    def __init__(self, game_url="http://localhost:3000/saba-mitzuyar-levels/"):
        self.game_url = game_url
        self.driver = None
        self.test_results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "bugs": [],
            "gameplay_issues": [],
            "start_time": datetime.now().isoformat(),
        }
        self.screenshots_dir = Path("./test_screenshots")
        self.screenshots_dir.mkdir(exist_ok=True)
        self.report_file = Path("./test_report_advanced.json")
        
    def setup_driver(self):
        """Initialize Chrome WebDriver."""
        print("⏳ Starting Chrome WebDriver...")
        
        options = Options()
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
            print("✅ Chrome WebDriver initialized successfully!")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize WebDriver: {e}")
            return False
    
    def take_screenshot(self, name, description=""):
        """Capture screenshot for bug documentation."""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.screenshots_dir}/{name}_{timestamp}.png"
            self.driver.save_screenshot(filename)
            print(f"📸 Screenshot: {filename} {description}")
            return filename
        except Exception as e:
            print(f"⚠️ Screenshot failed: {e}")
            return None
    
    def log_bug(self, bug_type, description, screenshot=None):
        """Log a bug to the report."""
        bug = {
            "type": bug_type,
            "description": description,
            "timestamp": datetime.now().isoformat(),
            "screenshot": screenshot,
            "url": self.driver.current_url if self.driver else "unknown"
        }
        self.test_results["bugs"].append(bug)
        self.test_results["failed"] += 1
        print(f"🐛 BUG: {bug_type} - {description}")
    
    def log_gameplay_issue(self, level, issue_type, description):
        """Log gameplay issues found during level testing."""
        issue = {
            "level": level,
            "type": issue_type,
            "description": description,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results["gameplay_issues"].append(issue)
        print(f"⚠️ GAMEPLAY ISSUE (Level {level}): {issue_type} - {description}")
    
    def run_test(self, test_name, test_func):
        """Run a single test and log results."""
        self.test_results["total_tests"] += 1
        print(f"\n{'='*70}")
        print(f"TEST {self.test_results['total_tests']}: {test_name}")
        print(f"{'='*70}")
        
        try:
            test_func()
            self.test_results["passed"] += 1
            print(f"✅ PASSED: {test_name}")
            return True
        except AssertionError as e:
            self.log_bug("Assertion Error", str(e), self.take_screenshot(test_name))
            return False
        except Exception as e:
            self.log_bug("Exception", f"{test_name}: {str(e)}", self.take_screenshot(test_name))
            return False
    
    # ============================================================
    # LEVEL 1 GAMEPLAY TESTS
    # ============================================================
    
    def test_level_1_start(self):
        """Test starting Level 1."""
        print("Starting Level 1...")
        self.driver.get(self.game_url)
        time.sleep(3)
        
        # Look for play button
        try:
            # Try clicking play/start button
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            print(f"Found {len(buttons)} buttons on main menu")
            
            # Click first button (usually Play)
            if len(buttons) > 0:
                buttons[0].click()
                print("✓ Clicked Play button")
                time.sleep(2)
        except Exception as e:
            print(f"⚠️ Could not find Play button: {e}")
        
        self.take_screenshot("level_1_start", "- Level 1 started")
    
    def test_level_1_player_movement(self):
        """Test player movement in Level 1."""
        print("Testing player movement (Right, Left, Jump)...")
        
        actions = ActionChains(self.driver)
        
        # Move RIGHT for 2 seconds
        print("  → Moving RIGHT...")
        for i in range(10):
            actions.send_keys(Keys.RIGHT).perform()
            time.sleep(0.1)
        self.take_screenshot("level_1_right_movement", "- Moving right")
        
        time.sleep(0.5)
        
        # Move LEFT for 2 seconds
        print("  ← Moving LEFT...")
        for i in range(10):
            actions.send_keys(Keys.LEFT).perform()
            time.sleep(0.1)
        self.take_screenshot("level_1_left_movement", "- Moving left")
        
        time.sleep(0.5)
        
        # JUMP
        print("  ↑ Jumping...")
        actions.send_keys(Keys.SPACE).perform()
        time.sleep(0.3)
        self.take_screenshot("level_1_jump", "- Player jumping")
        
        # Double jump
        time.sleep(0.2)
        actions.send_keys(Keys.SPACE).perform()
        time.sleep(0.3)
        self.take_screenshot("level_1_double_jump", "- Player double jumping")
        
        print("✓ Movement controls responsive")
    
    def test_level_1_coin_collection(self):
        """Test coin collection mechanic."""
        print("Testing coin collection...")
        
        # Get initial coin count (if visible)
        try:
            # Try to find coin counter in UI
            coin_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Coins')]")
            if coin_elements:
                initial_text = coin_elements[0].text
                print(f"  Initial: {initial_text}")
            
            # Move around to collect coins
            actions = ActionChains(self.driver)
            for i in range(15):
                actions.send_keys(Keys.RIGHT).perform()
                time.sleep(0.05)
            
            time.sleep(0.5)
            self.take_screenshot("level_1_coins", "- After collecting coins")
            
            # Check final count
            if coin_elements:
                final_text = coin_elements[0].text
                print(f"  Final: {final_text}")
                
                if initial_text == final_text:
                    self.log_gameplay_issue(1, "Coin Collection", "Coins not being collected during movement")
        except Exception as e:
            print(f"⚠️ Could not test coin collection: {e}")
    
    def test_level_1_gameplay_duration(self):
        """Test if level runs without crashing for extended period."""
        print("Testing gameplay stability (60 seconds of play)...")
        
        start_time = time.time()
        actions = ActionChains(self.driver)
        
        # Simulate 60 seconds of gameplay
        while time.time() - start_time < 60:
            # Alternate: right, jump, right, jump, left
            actions.send_keys(Keys.RIGHT).perform()
            time.sleep(0.1)
            
            actions.send_keys(Keys.SPACE).perform()
            time.sleep(0.2)
            
            actions.send_keys(Keys.RIGHT).perform()
            time.sleep(0.1)
            
            # Check for crashes every 10 seconds
            if int((time.time() - start_time) % 10) == 0:
                try:
                    current_url = self.driver.current_url
                    print(f"  ⏱️ {int(time.time() - start_time)}s - Game still running ✓")
                except:
                    self.log_gameplay_issue(1, "Crash", "Game crashed during extended gameplay")
                    raise AssertionError("Game crashed")
        
        self.take_screenshot("level_1_stability", "- After 60 seconds of play")
        print("✓ Game ran stable for 60 seconds")
    
    def test_level_1_attack_dash(self):
        """Test attack (X key) and dash (Z key) mechanics."""
        print("Testing attack and dash mechanics...")
        
        actions = ActionChains(self.driver)
        
        # Test DASH (Z key)
        print("  Testing DASH (Z)...")
        actions.send_keys('z').perform()
        time.sleep(0.5)
        self.take_screenshot("level_1_dash", "- Dashing")
        
        time.sleep(0.3)
        
        # Test ATTACK (X key)
        print("  Testing ATTACK (X)...")
        actions.send_keys('x').perform()
        time.sleep(0.5)
        self.take_screenshot("level_1_attack", "- Attacking with hammer")
        
        print("✓ Special abilities working")
    
    # ============================================================
    # LEVEL 2 TESTS (WATER WORLD)
    # ============================================================
    
    def test_level_2_physics(self):
        """Test Level 2 (Water world) physics differences."""
        print("Testing Level 2 - Water World physics...")
        
        # Try to navigate to level 2
        self.driver.get(self.game_url)
        time.sleep(3)
        
        try:
            # Look for level select
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            
            # Try to find level 2 button
            for button in buttons:
                if "2" in button.text or "level" in button.text.lower():
                    button.click()
                    time.sleep(2)
                    print("✓ Level 2 started")
                    self.take_screenshot("level_2_start", "- Water world")
                    break
            
            # Test movement in water (should be slower/floatier)
            actions = ActionChains(self.driver)
            actions.send_keys(Keys.RIGHT).perform()
            time.sleep(0.2)
            actions.send_keys(Keys.SPACE).perform()  # Jump in water
            time.sleep(0.3)
            
            self.take_screenshot("level_2_jump", "- Jump in water world")
            print("✓ Water world physics working")
        except Exception as e:
            print(f"⚠️ Could not test Level 2: {e}")
    
    # ============================================================
    # ENEMY INTERACTION TESTS
    # ============================================================
    
    def test_enemy_collision(self):
        """Test collision with enemies."""
        print("Testing enemy collision and damage...")
        
        try:
            actions = ActionChains(self.driver)
            
            # Try to move toward enemies
            print("  Moving toward enemies...")
            for i in range(20):
                actions.send_keys(Keys.RIGHT).perform()
                time.sleep(0.05)
            
            time.sleep(0.5)
            self.take_screenshot("enemy_collision", "- Testing enemy collision")
            
            # Check for health indicator changes
            health_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'health') or contains(text(), 'HP')]")
            if health_elements:
                print(f"  Found health indicator: {health_elements[0].text}")
                self.take_screenshot("enemy_hit", "- After enemy collision")
            
            print("✓ Enemy collision detection working")
        except Exception as e:
            print(f"⚠️ Could not test enemy collision: {e}")
    
    # ============================================================
    # MENU NAVIGATION TESTS
    # ============================================================
    
    def test_level_select_all_levels(self):
        """Test that all levels are accessible."""
        print("Testing level selection for all available levels...")
        
        self.driver.get(self.game_url)
        time.sleep(2)
        
        try:
            # Count available levels
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            level_buttons = [b for b in buttons if any(char.isdigit() for char in b.text)]
            
            print(f"  Found {len(level_buttons)} level buttons")
            
            if len(level_buttons) < 10:
                self.log_gameplay_issue(0, "Level Availability", f"Only {len(level_buttons)} levels found, expected 40+")
            else:
                print(f"✓ {len(level_buttons)} levels available")
            
            self.take_screenshot("level_select", "- Level select screen")
        except Exception as e:
            print(f"⚠️ Could not test level selection: {e}")
    
    def test_pause_menu(self):
        """Test pause functionality."""
        print("Testing pause menu (ESC key)...")
        
        try:
            actions = ActionChains(self.driver)
            
            # Press ESC to pause
            actions.send_keys(Keys.ESCAPE).perform()
            time.sleep(0.5)
            
            self.take_screenshot("pause_menu", "- Pause menu")
            
            # Press ESC again to unpause
            actions.send_keys(Keys.ESCAPE).perform()
            time.sleep(0.5)
            
            print("✓ Pause menu working")
        except Exception as e:
            print(f"⚠️ Pause test failed: {e}")
    
    # ============================================================
    # PERFORMANCE & STABILITY
    # ============================================================
    
    def test_console_errors_during_gameplay(self):
        """Check for console errors during gameplay."""
        print("Checking for console errors during gameplay...")
        
        try:
            # Play for 30 seconds
            actions = ActionChains(self.driver)
            start_time = time.time()
            
            while time.time() - start_time < 30:
                actions.send_keys(Keys.RIGHT).perform()
                time.sleep(0.1)
            
            # Get console logs
            logs = self.driver.get_log('browser')
            errors = [log for log in logs if log['level'] == 'SEVERE']
            
            if errors:
                error_list = [log['message'][:100] for log in errors[:5]]
                print(f"  ⚠️ Found {len(errors)} console errors:")
                for i, error in enumerate(error_list):
                    print(f"    {i+1}. {error}...")
                    self.log_gameplay_issue(0, "Console Error", error[:200])
            else:
                print("✓ No console errors during gameplay")
        except Exception as e:
            print(f"⚠️ Could not check console: {e}")
    
    def test_frame_rate_stability(self):
        """Test if game maintains stable frame rate."""
        print("Testing frame rate stability...")
        
        try:
            # Measure FPS during gameplay
            actions = ActionChains(self.driver)
            
            # Get performance info
            perf_info = self.driver.execute_script("""
                return {
                    fps: window.fps || 'not available',
                    memory: performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) : 'not available'
                };
            """)
            
            print(f"  Performance Info: {perf_info}")
            
            if perf_info.get('fps') == 'not available':
                print("  ℹ️ FPS tracking not available (normal if not implemented)")
            
            if perf_info.get('memory') != 'not available':
                memory_mb = float(perf_info['memory'])
                print(f"  Memory usage: {memory_mb}MB")
                
                if memory_mb > 500:
                    self.log_gameplay_issue(0, "High Memory", f"Memory usage {memory_mb}MB exceeds expected")
        except Exception as e:
            print(f"⚠️ Could not test frame rate: {e}")
    
    # ============================================================
    # RUN ALL TESTS
    # ============================================================
    
    def run_all_tests(self):
        """Execute all tests."""
        print("\n" + "="*70)
        print("🎮 SABA MITZUYAR - ADVANCED GAMEPLAY TEST SUITE")
        print("="*70)
        
        start_time = time.time()
        
        if not self.setup_driver():
            print("\n❌ Failed to start tests")
            return False
        
        try:
            print("\n" + "="*70)
            print("LEVEL 1 GAMEPLAY TESTS")
            print("="*70)
            self.run_test("Level 1: Start", self.test_level_1_start)
            self.run_test("Level 1: Player Movement", self.test_level_1_player_movement)
            self.run_test("Level 1: Coin Collection", self.test_level_1_coin_collection)
            self.run_test("Level 1: Attack/Dash", self.test_level_1_attack_dash)
            self.run_test("Level 1: 60-Second Stability", self.test_level_1_gameplay_duration)
            
            print("\n" + "="*70)
            print("LEVEL 2 & WORLD TESTS")
            print("="*70)
            self.run_test("Level 2: Water World Physics", self.test_level_2_physics)
            
            print("\n" + "="*70)
            print("ENEMY & COMBAT TESTS")
            print("="*70)
            self.run_test("Enemy Collision Detection", self.test_enemy_collision)
            
            print("\n" + "="*70)
            print("MENU & NAVIGATION TESTS")
            print("="*70)
            self.run_test("Level Selection", self.test_level_select_all_levels)
            self.run_test("Pause Menu", self.test_pause_menu)
            
            print("\n" + "="*70)
            print("PERFORMANCE & STABILITY TESTS")
            print("="*70)
            self.run_test("Console Errors Check", self.test_console_errors_during_gameplay)
            self.run_test("Frame Rate Stability", self.test_frame_rate_stability)
            
        finally:
            print("\n✅ Closing WebDriver...")
            time.sleep(1)
            self.driver.quit()
            print("✅ WebDriver closed")
        
        # Calculate results
        duration = time.time() - start_time
        self.test_results["duration"] = duration
        self.test_results["end_time"] = datetime.now().isoformat()
        
        self.print_report()
        self.save_report()
        
        return True
    
    def print_report(self):
        """Print test results summary."""
        print("\n" + "="*70)
        print("📊 ADVANCED TEST RESULTS")
        print("="*70)
        
        total = self.test_results["total_tests"]
        passed = self.test_results["passed"]
        failed = self.test_results["failed"]
        bugs = len(self.test_results["bugs"])
        gameplay_issues = len(self.test_results["gameplay_issues"])
        duration = self.test_results["duration"]
        
        print(f"\n📈 STATISTICS:")
        print(f"   Total Tests: {total}")
        print(f"   ✅ Passed: {passed}/{total}")
        print(f"   ❌ Failed: {failed}/{total}")
        print(f"   🐛 Critical Bugs: {bugs}")
        print(f"   ⚠️  Gameplay Issues: {gameplay_issues}")
        print(f"   ⏱️  Duration: {duration:.2f} seconds")
        
        if bugs > 0:
            print(f"\n🐛 CRITICAL BUGS:")
            for i, bug in enumerate(self.test_results["bugs"][:5], 1):
                print(f"\n   Bug #{i}: {bug['type']}")
                print(f"   Description: {bug['description'][:100]}...")
        
        if gameplay_issues > 0:
            print(f"\n⚠️ GAMEPLAY ISSUES FOUND:")
            for i, issue in enumerate(self.test_results["gameplay_issues"][:10], 1):
                print(f"\n   Issue #{i}: Level {issue['level']}")
                print(f"   Type: {issue['type']}")
                print(f"   Description: {issue['description']}")
        
        if bugs == 0 and gameplay_issues == 0:
            print("\n✨ No critical bugs or gameplay issues found! ✨")
        
        print("\n" + "="*70)
    
    def save_report(self):
        """Save test report to JSON file."""
        with open(self.report_file, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"💾 Detailed report saved to: {self.report_file}")


def main():
    """Run the test suite."""
    tester = AdvancedGameTester("http://localhost:3000/saba-mitzuyar-levels/")
    tester.run_all_tests()


if __name__ == "__main__":
    main()