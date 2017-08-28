/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */

import { Injectable } from '@angular/core';
import * as jsp from 'jsplumb';

/**
 * JsPlumbService
 * provides all of the operations about jsplumb plugin.
 */
@Injectable()
export class JsPlumbService {
    private jsplumbInstance;

    constructor() {

    }


    public initJsPlumbInstance() {
        this.jsplumbInstance = jsp.jsPlumb.getInstance({
            Container: 'container'
        });

        this.jsplumbInstance.importDefaults({
            Anchor: ['Top', 'RightMiddle', 'LeftMiddle', 'Bottom'],
            Connector: [
                'Flowchart',
                { cornerRadius: 0, stub: 0, gap: 3 },
            ],
            ConnectionOverlays: [
                [
                    'Arrow',
                    { direction: 1, foldback: 1, location: 1, width: 10, length: 10 },
                ],
                ['Label', { label: '', id: 'label', cssClass: 'aLabel' }],
            ],
            Endpoint: 'Blank',
            PaintStyle: {
                strokeWidth: 4,
                stroke: 'black',
            },
            HoverPaintStyle: {
                strokeWidth: 4,
                stroke: 'blue',
            },
        });

        // add connection to model data while a new connection is build
        this.jsplumbInstance.bind('connection', info => {
            // this.modelService.addConnection(info.connection.sourceId, info.connection.targetId);

            info.connection.bind('click', connection => {
                info.connection.bind('click', connection => {
                    // this.modelService.deleteConnection(connection.sourceId, connection.targetId);
                    this.jsplumbInstance.detach(connection);
                });
            });
        });

    }

    public initNode(selectorString: string) {
        const selector = this.jsplumbInstance.getSelector(selectorString);

        this.jsplumbInstance.draggable(selector, {
            // stop(event) {
            //     node.position.left = event.pos[0];
            //     node.position.top = event.pos[1];
            // },
        });

        this.jsplumbInstance.makeTarget(selector, {
            detachable: false,
            isTarget: true,
            maxConnections: -1,
        });

        this.jsplumbInstance.makeSource(selector, {
            filter: '.anchor, .anchor *',
            detachable: false,
            isSource: true,
            maxConnections: -1,
        });

    }


    public demo() {
        jsp.ready(() => {

            this.jsplumbInstance = jsp.jsplumb.getInstance({
                // default drag options
                DragOptions: { cursor: 'pointer', zIndex: 2000 },
                // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
                // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
                ConnectionOverlays: [
                    ["Arrow", {
                        location: 1,
                        visible: true,
                        width: 11,
                        length: 11,
                        id: "ARROW",
                        events: {
                            click: function () { alert("you clicked on the arrow overlay") }
                        }
                    }],
                    ["Label", {
                        location: 0.1,
                        id: "label",
                        cssClass: "aLabel",
                        events: {
                            tap: function () { alert("hey"); }
                        }
                    }]
                ],
                Container: "canvas"
            });

            var basicType = {
                connector: "StateMachine",
                paintStyle: { stroke: "red", strokeWidth: 4 },
                hoverPaintStyle: { stroke: "blue" },
                overlays: [
                    "Arrow"
                ]
            };
            this.jsplumbInstance.registerConnectionType("basic", basicType);

            // this is the paint style for the connecting lines..
            var connectorPaintStyle = {
                strokeWidth: 2,
                stroke: "#61B7CF",
                joinstyle: "round",
                outlineStroke: "white",
                outlineWidth: 2
            },
                // .. and this is the hover style.
                connectorHoverStyle = {
                    strokeWidth: 3,
                    stroke: "#216477",
                    outlineWidth: 5,
                    outlineStroke: "white"
                },
                endpointHoverStyle = {
                    fill: "#216477",
                    stroke: "#216477"
                },
                // the definition of source endpoints (the small blue ones)
                sourceEndpoint = {
                    endpoint: "Dot",
                    paintStyle: {
                        stroke: "#7AB02C",
                        fill: "transparent",
                        radius: 7,
                        strokeWidth: 1
                    },
                    isSource: true,
                    connector: ["Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
                    connectorStyle: connectorPaintStyle,
                    hoverPaintStyle: endpointHoverStyle,
                    connectorHoverStyle: connectorHoverStyle,
                    dragOptions: {},
                    overlays: [
                        ["Label", {
                            location: [0.5, 1.5],
                            label: "Drag",
                            cssClass: "endpointSourceLabel",
                            visible: false
                        }]
                    ]
                },
                // the definition of target endpoints (will appear when the user drags a connection)
                targetEndpoint = {
                    endpoint: "Dot",
                    paintStyle: { fill: "#7AB02C", radius: 7 },
                    hoverPaintStyle: endpointHoverStyle,
                    maxConnections: -1,
                    dropOptions: { hoverClass: "hover", activeClass: "active" },
                    isTarget: true,
                    overlays: [
                        ["Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible: false }]
                    ]
                },
                init = function (connection) {
                    connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
                };

            var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
                for (var i = 0; i < sourceAnchors.length; i++) {
                    var sourceUUID = toId + sourceAnchors[i];
                    this.jsplumbInstance.addEndpoint("flowchart" + toId, sourceEndpoint, {
                        anchor: sourceAnchors[i], uuid: sourceUUID
                    });
                }
                for (var j = 0; j < targetAnchors.length; j++) {
                    var targetUUID = toId + targetAnchors[j];
                    this.jsplumbInstance.addEndpoint("flowchart" + toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
                }
            };

            // suspend drawing and initialise.
            this.jsplumbInstance.batch(function () {

                _addEndpoints("Window4", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
                _addEndpoints("Window2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
                _addEndpoints("Window3", ["RightMiddle", "BottomCenter"], ["LeftMiddle", "TopCenter"]);
                _addEndpoints("Window1", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);

                // listen for new connections; initialise them the same way we initialise the connections at startup.
                this.jsplumbInstance.bind("connection", function (connInfo, originalEvent) {
                    init(connInfo.connection);
                });

                // make all the window divs draggable
                this.jsplumbInstance.draggable(this.jsplumbInstance.getSelector(".flowchart-demo .window"), { grid: [20, 20] });
                // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
                // method, or document.querySelectorAll:
                //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

                // connect a few up
                this.jsplumbInstance.connect({ uuids: ["Window2BottomCenter", "Window3TopCenter"], editable: true });
                this.jsplumbInstance.connect({ uuids: ["Window2LeftMiddle", "Window4LeftMiddle"], editable: true });
                this.jsplumbInstance.connect({ uuids: ["Window4TopCenter", "Window4RightMiddle"], editable: true });
                this.jsplumbInstance.connect({ uuids: ["Window3RightMiddle", "Window2RightMiddle"], editable: true });
                this.jsplumbInstance.connect({ uuids: ["Window4BottomCenter", "Window1TopCenter"], editable: true });
                this.jsplumbInstance.connect({ uuids: ["Window3BottomCenter", "Window1BottomCenter"], editable: true });
                //

                //
                // listen for clicks on connections, and offer to delete connections on click.
                //
                this.jsplumbInstance.bind("click", function (conn, originalEvent) {
                    // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
                    //   instance.detach(conn);
                    conn.toggleType("basic");
                });

                this.jsplumbInstance.bind("connectionDrag", function (connection) {
                    console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
                });

                this.jsplumbInstance.bind("connectionDragStop", function (connection) {
                    console.log("connection " + connection.id + " was dragged");
                });

                this.jsplumbInstance.bind("connectionMoved", function (params) {
                    console.log("connection " + params.connection.id + " was moved");
                });
            });

            jsp.jsPlumb.fire("jsPlumbDemoLoaded", this.jsplumbInstance);

        });
    }
}
