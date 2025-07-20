export class BackgroundManager {
  private currentTheme: string = 'forest';
  private basePath = '/assets/external-resources/parallax-backgrounds/bongseng-parallax/';

  loadParallaxBackground(theme: string): string[] {
    this.currentTheme = theme;
    return this.getThemeLayers(theme);
  }

  private getThemeLayers(theme: string): string[] {
    const horizontalPath = `${this.basePath}horizontal/${theme}/`;

    switch(theme) {
      case 'forest':
        return [
          `${horizontalPath}forest_sky.png`,
          `${horizontalPath}forest_moon.png`,
          `${horizontalPath}forest_mountain.png`,
          `${horizontalPath}forest_back.png`,
          `${horizontalPath}forest_mid.png`,
          `${horizontalPath}forest_long.png`,
          `${horizontalPath}forest_short.png`
        ];
      case 'desert':
        return [
          `${horizontalPath}desert_sky.png`,
          `${horizontalPath}desert_moon.png`,
          `${horizontalPath}desert_mountain.png`,
          `${horizontalPath}desert_cloud.png`,
          `${horizontalPath}desert_dunemid.png`,
          `${horizontalPath}desert_dunefrontt.png`
        ];
      case 'sky':
        return [
          `${horizontalPath}Sky_sky.png`,
          `${horizontalPath}sky_moon.png`,
          `${horizontalPath}Sky_back_mountain.png`,
          `${horizontalPath}sky_front_mountain.png`,
          `${horizontalPath}sky_clouds.png`,
          `${horizontalPath}sky_cloud_floor.png`,
          `${horizontalPath}sky_cloud_floor_2.png`,
          `${horizontalPath}Sky_front_cloud.png`,
          `${horizontalPath}Sky_cloud_single.png`
        ];
      case 'moon':
        return [
          `${horizontalPath}moon_sky.png`,
          `${horizontalPath}moon_earth.png`,
          `${horizontalPath}moon_back.png`,
          `${horizontalPath}moon_mid.png`,
          `${horizontalPath}moon_front.png`,
          `${horizontalPath}moon_floor.png`
        ];
      default:
        return [];
    }
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  preloadTheme(theme: string): Promise<void[]> {
    const layers = this.getThemeLayers(theme);
    const promises = layers.map(src => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });
    });
    
    return Promise.all(promises);
  }
}