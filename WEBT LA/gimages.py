import os
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager  # Automatically installs ChromeDriver

def get_game_images(url, save_folder="game_images"):
    os.makedirs(save_folder, exist_ok=True)
    
    # Initialize Selenium WebDriver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get(url)
    
    # Retrieve page source and parse with BeautifulSoup
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()
    
    # Update these selectors based on actual HTML structure
    games = soup.find_all("div", class_="game-container")  # Replace with actual structure

    download_count = 0
    for game in games:
        game_name = game.find("h3", class_="game-title").get_text(strip=True)  # Update as needed
        img_tag = game.find("img", class_="game-image")  # Update as needed
        if img_tag and img_tag.get("src"):
            img_url = img_tag["src"]
            try:
                img_data = requests.get(img_url).content
                img_name = f"{game_name}.jpg"
                img_path = os.path.join(save_folder, img_name)
                with open(img_path, "wb") as img_file:
                    img_file.write(img_data)
                print(f"Downloaded and saved image for game: {game_name}")
                download_count += 1
            except Exception as e:
                print(f"Failed to download image for {game_name}: {e}")

    if download_count == 0:
        print("No images were downloaded.")

# Example usage
url = "https://www.pcgamesn.com/old-games-best-classic-pc-games"  # Replace with the actual URL
get_game_images(url)
