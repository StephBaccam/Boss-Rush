import Player from "../player.js"
import Orc from "../orc.js"

export class FirstLevel extends Phaser.Scene {
    constructor() {
        super({ key: 'FirstLevel', physics: { default: 'arcade' } }); // Active la physique arcade
    }

    preload() {
        // Charger le fichier JSON de Tiled
        this.load.tilemapTiledJSON("map", "assets/Map2.json");

        // Charger l’image du tileset
        this.load.image("tiles", "assets/tileset.png");

        // Charger la barre de vie du boss
        this.load.image("healthbar", "assets/Boss-Healthbar.png");

        // Charger le spritesheet avec des frames de 100x100 pixels
        this.load.spritesheet("soldier", "assets/soldier/Soldier.png", { frameWidth: 100, frameHeight: 100 });

        // Charger le spritesheet avec des frames de 100x100 pixels
        this.load.spritesheet("orc", "assets/orc/Orc.png", { frameWidth: 100, frameHeight: 100 });
    }

    create() {
        // Vérifier que la physique est bien activée
        console.log("Physics system:", this.physics);

        // Keys config
        this.keys = this.input.keyboard.addKeys({
            up: "Z",
            left: "Q",
            down: "S",
            right: "D"
        });

        this.attackKey = this.input.keyboard.addKey(32)

        // Créer la healthbar et la positionner en haut de l'écran, centrée horizontalement
        this.healthbar = this.add.sprite(this.cameras.main.centerX - 200, 25, 'healthbar'); 

        // Redimensionner la healthbar si nécessaire (optionnel)
        this.healthbar.setDisplaySize(400, 15); // Taille de la barre de vie

        // Centrer la healthbar horizontalement (l'origine est par défaut en haut à gauche)
        this.healthbar.setOrigin(0, 0); // Centré horizontalement et en haut de l'écran

        // Assurer que la healthbar est visible devant tout le reste
        this.healthbar.setDepth(1);  // Mettre un depth supérieur à celui des autres éléments

        // Create tilemap from JSON
        const map = this.make.tilemap({ key: "map", tileWidth: 16, tileHeight: 16 });

        // Add tileset image (ensure the name matches the one in Tiled)
        const tileset = map.addTilesetImage("tiles1", "tiles");

        // Create layers (modify layer names according to your map)
        const backgroundLayer = map.createLayer("Background", tileset, 0, 0);
        const groundLayer = map.createLayer("Ground", tileset, 0, 0); // Ajout du layer Ground

        // Ajouter la collision pour le layer "Ground" (activer la collision pour les tiles)
        groundLayer.setCollisionByExclusion([-1]); // Cela exclut les tiles avec un index de -1 (qui ne sont pas solides)

        // Player
        this.player = new Player(this, 400, 352);

        // Orc
        this.orc = new Orc(this, 600, 352)

        // Ajout des contrôles clavier
        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.collider(this.player, groundLayer);
        this.physics.add.collider(this.orc, groundLayer);
        this.physics.add.collider(this.player, this.orc);

    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
            this.player.attack(this.orc, this.updateHealthBar.bind(this));
        }

        // Mouvement
        this.player.move(this.keys);

        // Enemy movement 
        this.orc.update(this.player);
    }

    updateHealthBar(healthPercentage) {
        // healthPercentage doit être un nombre entre 0 et 1
        this.healthbar.displayWidth = 400 * healthPercentage; // Réduire la largeur en gardant la gauche fixe
    }
}