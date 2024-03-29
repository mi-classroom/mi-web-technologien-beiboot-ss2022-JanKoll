import * as THREE from 'three';

export function createYearLabel (message: string, properties: TextSpriteProperties = {}): THREE.Sprite {
    const fontface = properties.fontface ? properties.fontface : "Courier New";
    const fontsize = properties.fontsize ? properties.fontsize : 18;
    const borderThickness = properties.borderThickness ? properties.borderThickness : 4;
    const borderColor = properties.borderColor ? properties.borderColor : { r: 0, g: 0, b: 0, a: 1.0 };
    const backgroundColor = properties.backgroundColor ? properties.backgroundColor : { r: 0, g: 0, b: 255, a: 1.0 };
    const textColor = properties.textColor ? properties.textColor : { r: 255, g: 255, b: 255, a: 1.0 };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = "Bold " + fontsize + "px " + fontface;

    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
    context.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
    context.fillText(message, borderThickness, fontsize + borderThickness);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    return sprite;
};