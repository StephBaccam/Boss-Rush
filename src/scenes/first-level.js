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
        this.healthbar = this.add.sprite(this.cameras.main.centerX, 25, 'healthbar');

        // Redimensionner la healthbar si nécessaire (optionnel)
        this.healthbar.setDisplaySize(400, 10); // Taille de la barre de vie

        // Centrer la healthbar horizontalement (l'origine est par défaut en haut à gauche)
        this.healthbar.setOrigin(0.5, 0); // Centré horizontalement et en haut de l'écran

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
        // Position de départ du joueur (en pixels)
        const playerStartX = 400;
        const playerStartY = 352;

        // Créer le joueur à la position calculée
        this.player = this.physics.add.sprite(playerStartX, playerStartY, "soldier");

        // Ajuster la taille de la zone de collision sans changer la taille de l'image
        this.player.setSize(12, 18); // Par exemple, une taille de 50x80 au lieu de la taille par défaut

        // Centrer la zone de collision sur le sprite
        this.player.setOffset(44, 40); // Ajuste l'offset pour mieux centrer la zone de collision

        this.player.setCollideWorldBounds(true);

        // Ajouter l'animation de marche (ajuste les index de frames si besoin)
        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("soldier", { start: 9, end: 16 }), // Ajuster selon l'asset
            frameRate: 10,
            repeat: -1
        });

        // Ajouter l'animation d'attente (Idle)
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("soldier", { start: 0, end: 5 }), // Ajuster selon l'asset
            frameRate: 5,
            repeat: -1
        });

        // Animation d'attaque
        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNumbers("soldier", { start: 18, end: 23 }),
            frameRate: 10,  // Vitesse de l'animation
            repeat: 0       // Ne se répète pas
        });

        this.isAttacking = false;

        // Jouer l'animation d'attente par défaut
        this.player.anims.play("idle");

        // Player settings
        this.player.setScale(1.5);
        this.player.body.gravity.y = 800; // Valeur plus élevée → Chute plus rapide

        // Orc
        this.orc = this.physics.add.sprite(600, playerStartY, "orc");
        this.orc.setCollideWorldBounds(true);
        this.orc.setSize(12, 18);  // Taille du sprite de l'orc
        this.orc.setOffset(44,40);
        this.orc.setScale(3);
        this.orc.setFlipX(true);

        // Ajouter l'animation d'attente (Idle)
        this.anims.create({
            key: "idle-orc",
            frames: this.anims.generateFrameNumbers("orc", { start: 0, end: 5 }), // Ajuster selon l'asset
            frameRate: 5,
            repeat: -1
        });

        this.orc.anims.play("idle-orc");

        // Ajout des contrôles clavier
        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.collider(this.player, groundLayer);
        this.physics.add.collider(this.orc, groundLayer);
        this.physics.add.collider(this.player, this.orc);

    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
            console.log("Attacking")
            this.isAttacking = true;
            this.player.play("attack", true);
            this.attack()
            
            this.player.once("animationcomplete", () => {
                this.isAttacking = false;
            });
        }

        // Mouvement
        if (this.keys.left.isDown) {
            this.player.setVelocityX(-150);
            this.player.setFlipX(true); // Retourner le sprite à gauche
        } else if (this.keys.right.isDown) {
            this.player.setVelocityX(150);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.keys.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-300);
        }

        if (!this.player.body.blocked.down && this.keys.down.isDown) {
            this.player.setVelocityY(300);
        }

        // Empêcher d'écraser l'animation d'attaque avec "walk" ou "idle"
        if (!this.isAttacking) {
            if (this.player.body.velocity.x !== 0) {
                this.player.play("walk", true);
            } else {
                this.player.play("idle", true);
            }
        }
    }

    attack() {
        // Définir la portée de l'attaque (ex: 50 pixels devant le joueur)
        let attackRange = 50;
        
        // Vérifier si l'ennemi est devant le joueur
        let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.orc.x, this.orc.y);

        if (distance < attackRange) {
            // Mettre à jour la barre de vie
            this.updateHealthBar(this.orc.health/30);

            // Vérifier si l'ennemi est mort
            if (this.orc.health <= 0) {
                this.orc.destroy(); // Supprimer l'ennemi du jeu
                console.log("L'ennemi est mort !");
            }
        }
    }

    updateHealthBar(healthPercentage) {
    // healthPercentage doit être un nombre entre 0 et 1
    this.healthbar.displayWidth = 400 * healthPercentage; // 400px est la largeur initiale de la healthbar
    }
}