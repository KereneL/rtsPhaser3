import Phaser from 'phaser';
import { unitTypes } from '../classes/unitTypes';
import { Unit } from '../classes/Unit';

export class FirstScene extends Phaser.Scene {
    map;
    tileset;
    groundLayer;
    wallsLayer;
    propsLayer;

    controls;
    marker;
    isPanning;
    isSelecting;
    pointerStartPosition;
    cameraStartPosition;

    units = [];
    selected = new Set();

    constructor() {
        super('first-scene');
    }
    // triggers when a scene is created. It accepts the Data Object that we can pass when we call game.
    // scenes.add(dataForInit) or game.scenes.start(dataForInit). For example, when we create a scene while being in some other scene (yes, you can do that). All scenes will be at the same hierarchy level, with no nested scenes.
    init(data) {

    }
    // this method  defines what we need to load as assets
    preload() {
        this.load.tilemapTiledJSON('forgottenPlainsMap', '../src/assets/tilemaps/forgotten-plains.json');
        this.loadGraphics();
    }
    // this method triggered when scene is created. specify positioning and render
    create(data) {
        this.input.mouse.disableContextMenu();
        //this.fpsText = this.add.text(5, 5, '', { font: '8px monospace' });
        this.createMap();
        this.setMapBounds();
        this.createCursorAnims()
        this.createUnitsAnims();
        this.setCameraControls();
        this.createMarker();
        this.createSelectBox();
        
        
        this.units.push(new Unit({
            scene: this,
            x: 35,
            y: 19,
            key: 'rhino',
            speed: 120
        }))
        // this.units.push(new Unit({
        //     scene: this,
        //     x: 30,
        //     y: 19,
        //     key: 'orc',
        //     speed: 0.2
        // }))
        // this.units.push(new Unit({
        //     scene: this,
        //     x: 25,
        //     y: 19,
        //     key: 'human',
        //     speed: 0.2
        // }))
        // this.units.push(new Unit({
        //     scene: this,
        //     x: 20,
        //     y: 19,
        //     key: 'human',
        //     speed: 0.2
        // }))
        // this.units.push(new Unit({
        //     scene: this,
        //     x: 15,
        //     y: 19,
        //     key: 'orc',
        //     speed: 0.2
        // }))
        this.units.push(new Unit({
            scene: this,
            x: 10,
            y: 19,
            key: 'cow',
            speed: 50
        }))
        
        this.isPanning = false;
        this.isSelecting = false;
        this.pointerStartPosition = new Phaser.Math.Vector2();
        this.cameraStartPosition = new Phaser.Math.Vector2();
        this.applyListeners();
    }
    update(time, delta) {
        //— a method that gets called with every render frame (on average, 60 times per second). It’s a game loop in which redrawing, moving objects, etc. occurs.

        //TODO: deltaTime manager :)
        this.updateMarker();
        this.units.forEach(unit => {
            unit.update(delta)
        })
        //this.fpsText.setText(`${this.sys.game.loop.actualFps}`).setDepth(9002)
    }

    // for Preload Functions
    loadGraphics() {
        this.load.spritesheet('cursor-effects', '../src/assets/graphics/Minifantasy_GuiCursorClickEffects.png', {frameWidth: 16, frameHeight: 16});

        this.loadTilesetsGraphics();
        this.loadUnitGraphics();
    }
    loadTilesetsGraphics(){
        this.load.image('forgottenPlains-tiles', '../src/assets/graphics/freeAssets/Tileset/Minifantasy_ForgottenPlains_Tiles.png');
        this.load.image('forgottenPlains-props', '../src/assets/graphics/freeAssets/Props/Minifantasy_ForgottenPlains_Props.png');
        this.load.image('dungeon-tiles', '../src/assets/graphics/freeAssets/Tileset/Minifantasy_Dungeon_Tiles.png');
        this.load.image('dungeon-props', '../src/assets/graphics/freeAssets/Props/Minifantasy_Dungeon_Props.png');

        this.load.image('builders-tiles', '../src/assets/graphics/BuildersTileset.png');
        this.load.image('dwarven-tiles', '../src/assets/graphics/DwarvenTileset.png');
        this.load.image('dwarven-props', '../src/assets/graphics/DwarvenProps.png');
    }
    loadUnitGraphics() {
        for (const unitType in unitTypes) {
            const unit = unitTypes[unitType];
            this.loadSpriteSheets(unit)
        }
    }
    loadSpriteSheets(unitType) {
        unitType.sheetFileNames.forEach(sheetFileName => {
            let ssKey = `${unitType.baseKey}-${sheetFileName.ssKey}`

            let path = `../src/assets/graphics/FreeAssets/Characters` +
                `/${unitType.fileName}` +
                `/${sheetFileName.fileName}` +
                `.png`;
            let frameConfig = unitType.frameConfig;
            this.load.spritesheet(ssKey, path, frameConfig)
        });
    }

    // for Create Functions
    createCursorAnims() {
        let rows = 12
        let sheetLength = 4;

        for (let i = 0; i < rows; i++) {
            const animKey = `cursor-effect-${i}`;
            const frames = [];

            // Push all frames in row i to frame
            for (let fr = 0; fr < sheetLength; fr++) {
                const frame = (i * sheetLength) + fr;
                frames.push(frame)

            }
            // Use frame to create anim
            this.anims.create({
                key: animKey,
                frames: this.anims.generateFrameNumbers('cursor-effects',{frames: frames}),
                frameRate: 8,
                repeat: 0,
            });
        }
    }
    createUnitsAnims() {
        for (const unitType in unitTypes) {
            const unit = unitTypes[unitType];
            this.createUnitAnims(unit)
        }
    }
    createUnitAnims(unitType) {
        unitType.anims.forEach(anim => {
            this.createUnitAnim(unitType.baseKey, anim)
        })
    }
    createUnitAnim(baseKey, anim) {
        const ssKey = `${baseKey}-${anim.ssKey}`;
        let directions;
        if (anim.hasOwnProperty('directions')) {
            directions = anim.directions
        } else {
            directions = ['']
        }

        directions.forEach((dir, index) => {
            const animKey = `${baseKey}-${anim.animKey}${dir}`
            const frames = [];
            for (let i = 0; i < anim.sheetLength; i++) {
                const frame = index * anim.sheetLength + i
                frames.push(frame)
            }
            this.anims.create({
                key: animKey,
                frames: this.anims.generateFrameNumbers(`${ssKey}`, {
                    frames: frames
                }),
                frameRate: anim.frameRate,
                repeat: anim.repeat
            });
        })
    }

    // Map and Display Initialization
    createMap() {
        this.map = this.make.tilemap({
            key: 'forgottenPlainsMap'
        });
        const tilesets = [];
        tilesets.push(this.map.addTilesetImage('tiles-forgottenPlains', 'forgottenPlains-tiles'))
        tilesets.push(this.map.addTilesetImage('props-forgottenPlains', 'forgottenPlains-props'))
        tilesets.push(this.map.addTilesetImage('tiles-dungeon', 'dungeon-tiles'))
        tilesets.push(this.map.addTilesetImage('props-dungeon', 'dungeon-props'))
        tilesets.push(this.map.addTilesetImage('tiles-dwarven', 'dwarven-tiles'))
        tilesets.push(this.map.addTilesetImage('props-dwarven', 'dwarven-props'))
        tilesets.push(this.map.addTilesetImage('tiles-builders', 'builders-tiles'))

        this.groundLayer = this.map.createLayer('ground', tilesets, 0, 0);
        this.wallsLayer = this.map.createLayer('walls', tilesets, 0, 0);
        this.aboveUnitLayer = this.map.createBlankLayer('upper-walls', tilesets, 0, 0);

        this.itemsLayer = this.map.createLayer('items', tilesets, 0, 0);

        const checkLayers = [this.wallsLayer, this.itemsLayer];

        for (let l = 0; l < checkLayers.length; l++) {
            let layer = checkLayers[l];

            this.map.setLayer(layer);
            this.map.filterTiles(tile => {
                if (tile.properties.collides) {
                    this.groundLayer.getTileAt(tile.x, tile.y).properties.collides = true;
                }
                if (tile.properties.aboveUnit) {
                    this.map.putTilesAt(tile, tile.x, tile.y, false, this.aboveUnitLayer)
                    tile.destroy()
                }
            })
        }

        this.groundLayer.setDepth(0)
        this.wallsLayer.setDepth(100)
        this.itemsLayer.setDepth(100)
        this.aboveUnitLayer.setDepth(300)
        this.map.setLayer(this.groundLayer);
    }
    setMapBounds() {
        let numTileBounds = 0
        let horizontalBoundsPadding = numTileBounds * this.map.tileWidth;
        let verticalBoundsPadding = numTileBounds * this.map.tileHeight;
        this.cameras.main.setBounds(
            0 - horizontalBoundsPadding,
            0 - verticalBoundsPadding,
            this.map.widthInPixels + 2 * horizontalBoundsPadding,
            this.map.heightInPixels + 2 * verticalBoundsPadding);
    }
    setCameraControls() {
        this.cameras.main.setZoom(2)
    }
    createMarker() {
        this.marker = this.add.graphics();
        this.marker.lineStyle(1, 0xDDDD00, 1);
        this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);
        this.marker.setDepth(700)
    }
    createSelectBox() {
        this.selectBox = this.add.rectangle(0, 0, 0, 0, 0x555555, 0.5).setStrokeStyle(4, 0xff0000, 1)
        this.selectBox.setDepth(100)
    }
    applyListeners() {
        this.input.setTopOnly(true);

        this.groundLayer.setInteractive();
        this.groundLayer.on('pointerdown', this.handlePointerDown, this);
        this.groundLayer.on('pointermove', this.handlePointerMove, this);
        this.groundLayer.on('pointerup', this.handlePointerUp, this);

        // Camera Control
        this.input.on('wheel', this.handleMouseWheel, this);
    }

    // Input Handlers
    handlePointerDown(pointer) {
        if (pointer.leftButtonDown()) {
            this.handleLeftButtonDown(pointer);
        } else if (pointer.middleButtonDown()) {
            this.handleMiddleButtonDown(pointer);
        } else if (pointer.rightButtonDown()) {
            this.handleRightButtonDown(pointer);
        }
    }
    handlePointerUp(pointer) {
        if (pointer.leftButtonReleased()) {
            this.handleLeftButtonReleased(pointer)
        }
        if (pointer.middleButtonReleased()) {
            this.handleMiddleButtonReleased(pointer)
        }
        if (pointer.rightButtonReleased()) {
            this.handleRightButtonReleased(pointer)
        }
    }
    handlePointerMove(pointer) {
        this.handleMouseMove(pointer);
    }
    handleMouseWheel(pointer, gameObjects, deltaX, deltaY) {
        this.handleZoomfunction(deltaY)
    }

    // Seperated Mouse Logic Handlers
    handleLeftButtonDown(pointer) {
        // Left down on ground layer - start box selection
        this.startBoxSelection(pointer);
    }
    handleLeftButtonReleased(pointer) {
        // Left down on ground layer - end box selection,
        // if none are selected - deselect
        // if some are selected - select only them
        // if ctrl was down and some are selected - add to this.selected
        // if ctrl was down and none are selected - add empty selection = do nothing
        this.endBoxSelection();
    }
    handleMiddleButtonDown(pointer) {
        // wheel down on ground layer - pan map
        this.handlePanningStart(pointer)
        return;
    }
    handleMiddleButtonReleased(pointer) {
        // Middle mouse button is released, stop panning
        this.input.setDefaultCursor('default')
        this.isPanning = false;
    }
    handleRightButtonDown(pointer) {
        // right down on ground layer - order selected units
        if (this.selected.size > 0)
            this.selectionOrder();
        return;
    }
    handleRightButtonReleased(pointer) {
        return;
    }
    handleMouseMove(pointer) {
        if (this.isPanning) {
            this.handlePanningMove(pointer);
            return;
        }
        if (this.isSelecting) {
            this.moveBoxSelection(pointer);
            return;
        }
    }

    // Camera Logic
    handleZoomfunction(deltaY) {
        let minZoom = 1;
        let newZoom = this.cameras.main.zoom;
        let maxZoom = 4;

        if (deltaY > 0) {
            newZoom /= 2;
        }
        if (deltaY < 0) {
            newZoom *= 2;
        }

        if (newZoom < minZoom) newZoom = minZoom;
        if (newZoom > maxZoom) newZoom = maxZoom;

        this.cameras.main.zoom = newZoom
    }

    // Selection and Marker Logic
    updateMarker() {
        if (this.isPanning) return

        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        // Rounds down to nearest tile
        const pointerTileX = this.map.worldToTileX(worldPoint.x);
        const pointerTileY = this.map.worldToTileY(worldPoint.y);

        // Snap to tile coordinates, but in world space
        this.marker.x = this.map.tileToWorldX(pointerTileX);
        this.marker.y = this.map.tileToWorldY(pointerTileY);

        let hoverText = "";
        if (this.selected.size == 0) {
            hoverText =
                `TileXY: [${pointerTileX}, ${pointerTileY}]
        WorldXY: [${Math.floor(worldPoint.x)}, ${Math.floor(worldPoint.y)}]`
        } else {
            this.selected.forEach((selectedUnit) => {
                hoverText += selectedUnit.key + ", ";
            })
        }
        document.getElementById('hover-text').textContent = hoverText
    }
    selectionSelect() {}
    selectionDeselect() {
        // Deselect
        this.selected.forEach((unit) => {
            unit.deselectUnit()
        })
    }
    startBoxSelection(pointer) {
        this.isSelecting = true;
        const worldPoint = pointer.positionToCamera(this.cameras.main);

        this.selectBox.x = worldPoint.x;
        this.selectBox.y = worldPoint.y;
    }
    moveBoxSelection(pointer) {
        const worldPoint = pointer.positionToCamera(this.cameras.main);

        this.selectBox.width = worldPoint.x - this.selectBox.x;
        this.selectBox.height = worldPoint.y - this.selectBox.y;

        // Handle "reversed" boxes
        let minX = Math.min(this.selectBox.x, this.selectBox.x + this.selectBox.width);
        let minY = Math.min(this.selectBox.y, this.selectBox.y + this.selectBox.height);
        let absWidth = Math.abs(this.selectBox.width);
        let absHeight = Math.abs(this.selectBox.height);

        const boxSelectRect = new Phaser.Geom.Rectangle(minX, minY, absWidth, absHeight)

        let hovered = this.units.filter(unit => {
            if (!unit.selected) {
                unit.selectablePointerOut();
            }
            
            let hitArea = new Phaser.Geom.Rectangle(unit.x-4, unit.y-4, unit.hitRect.width, unit.hitRect.height) 
            return Phaser.Geom.Rectangle.Overlaps(boxSelectRect, hitArea)
        })

        hovered.forEach(unit => {
            unit.selectablePointerOver()
        })
    }
    endBoxSelection() {
        this.isSelecting = false;
        if (!this.input.keyboard.addKey('CTRL').isDown) {
            this.selectionDeselect()
        }

        let minX = Math.min(this.selectBox.x, this.selectBox.x + this.selectBox.width);
        let minY = Math.min(this.selectBox.y, this.selectBox.y + this.selectBox.height);
        let absWidth = Math.abs(this.selectBox.width);
        let absHeight = Math.abs(this.selectBox.height);
        const geomRect = new Phaser.Geom.Rectangle(minX, minY, absWidth, absHeight)

        let selected = this.units.filter(unit => {
            const unitRect = new Phaser.Geom.Rectangle(unit.x-4, unit.y-4, unit.hitRect.width, unit.hitRect.height) 
            return Phaser.Geom.Rectangle.Overlaps(geomRect, unitRect)
        })

        this.selectBox.width = 0;
        this.selectBox.height = 0;

        selected.forEach(unit => {
            unit.selectUnit()
        })

        if (selected.size == 0) {
            this.selectionDeselect()
        }
        //Add Logic

    }

    // Panning Logic
    handlePanningStart(pointer) {
        // Start panning

        // Store pointer position and camera position
        this.pointerStartPosition.set(pointer.x, pointer.y);
        this.cameraStartPosition.set(this.cameras.main.scrollX, this.cameras.main.scrollY);

        // Turn pan state on
        this.input.setDefaultCursor('grab')
        this.isPanning = true;
    }
    handlePanningMove(pointer) {
        let scrollFactor = 1;

        // Calculate the distance moved by the pointer
        let dx = pointer.x - this.pointerStartPosition.x;
        let dy = pointer.y - this.pointerStartPosition.y;

        // Adjust the camera position based on the pointer movement
        this.cameras.main.scrollX = this.cameraStartPosition.x - (dx * scrollFactor) / this.cameras.main.zoom;
        this.cameras.main.scrollY = this.cameraStartPosition.y - (dy * scrollFactor) / this.cameras.main.zoom;
    }

    //Order Units
    selectionOrder(delta) {
        this.selected.forEach(unit => unit.orderMove(delta));
        this.cursorEffect(5)
    }
    cursorEffect(index){
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        const tileXY = {x:this.map.worldToTileX(worldPoint.x), y: this.map.worldToTileY(worldPoint.y)}
        const centerTileXY = {x: this.map.tileWidth*(tileXY.x+.5),y: this.map.tileHeight*(tileXY.y+.5)}
        let gO =  this.add.sprite(centerTileXY.x,centerTileXY.y , 'cursor-effect-sprite')
        gO.setDepth(9001);
        gO.play(`cursor-effect-${index}`, false)
        gO.once('animationcomplete', ()=>{
            gO.destroy();
          })
    }
}