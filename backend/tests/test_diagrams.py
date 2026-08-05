def test_ev_workspace_generates_clear_diagram_artifacts(client):
    response = client.post(
        "/api/v1/workspaces",
        json={
            "title": "VoltReserve",
            "description": (
                "Build an EV charging station booking platform for metro cities with "
                "station discovery, charger availability, slot booking, payments, "
                "refunds, operator controls, and charging session tracking."
            ),
            "business_context": (
                "The first release should support rapid city pilots with clear operator "
                "tooling and auditable payment flows."
            ),
            "budget": "medium",
            "preferred_cloud": "AWS",
            "constraints": ["Must use PostgreSQL", "Audit logs required"],
        },
    )

    assert response.status_code == 201
    workspace = response.json()

    assert workspace["requirements"]["domain"] == "EV Charging Booking Platform"
    assert set(workspace["diagrams"].keys()) == {
        "use_case",
        "activity",
        "sequence",
        "class",
        "er",
        "component",
        "deployment",
    }

    use_case = workspace["diagrams"]["use_case"]["mermaid"]
    er_diagram = workspace["diagrams"]["er"]["mermaid"]
    class_diagram = workspace["diagrams"]["class"]["mermaid"]

    assert "EV CHARGING STATION BOOKING SYSTEM" in use_case
    assert "Payment Gateway" in use_case
    assert "View booking<br/>dashboard" in use_case
    assert "Cancel<br/>booking" in use_case
    assert "extends" in use_case

    assert "STATION" in er_diagram
    assert "CHARGER" in er_diagram
    assert "BOOKING" in er_diagram
    assert "PAYMENT" in er_diagram
    assert "||--o{" in er_diagram or "||--||" in er_diagram
    assert "*id" in er_diagram

    assert "Station" in class_diagram
    assert "Booking" in class_diagram
    assert "Payment" in class_diagram


def test_pharmacy_workspace_generates_domain_specific_diagrams(client):
    response = client.post(
        "/api/v1/workspaces",
        json={
            "title": "MediBridge",
            "description": (
                "Build an online pharmacy with medicine search, prescription upload, "
                "pharmacist verification, secure checkout, order tracking, "
                "inventory controls, and delivery partner updates."
            ),
            "business_context": (
                "The first release needs safe prescription handling, clear stock "
                "visibility, and operational fulfillment tracking."
            ),
            "budget": "medium",
            "preferred_cloud": "AWS",
            "constraints": ["Must use PostgreSQL", "Audit logs required"],
        },
    )

    assert response.status_code == 201
    workspace = response.json()

    assert workspace["requirements"]["domain"] == "Online Pharmacy"

    use_case = workspace["diagrams"]["use_case"]["mermaid"]
    activity = workspace["diagrams"]["activity"]["mermaid"]
    sequence = workspace["diagrams"]["sequence"]["mermaid"]
    er_diagram = workspace["diagrams"]["er"]["mermaid"]
    class_diagram = workspace["diagrams"]["class"]["mermaid"]

    assert "ONLINE PHARMACY SYSTEM" in use_case
    assert "Place prescription<br/>order" in use_case
    assert "Verify<br/>prescription" in use_case
    assert "View station" not in use_case

    assert "Prescription required?" in activity
    assert "Authorize payment" in activity
    assert "dispatch shipment" in activity

    assert "Prescription Service" in sequence
    assert "Inventory Service" in sequence
    assert "Delivery Service" in sequence

    assert "INVENTORY" in er_diagram
    assert "PRESCRIPTION" in er_diagram
    assert "ORDER_ITEM" in er_diagram
    assert "PAYMENT" in er_diagram
    assert "SHIPMENT" in er_diagram

    assert "Inventory" in class_diagram
    assert "Prescription" in class_diagram
    assert "Shipment" in class_diagram
