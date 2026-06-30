from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.cloud_resource import CloudResource
from app.schemas.cloud_resource import (
    CloudResourceCreate,
    CloudResourceUpdate,
    CloudResourceResponse
)
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/resources",
    tags=["Cloud Resources"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=CloudResourceResponse)
def create_resource(
    resource: CloudResourceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_resource = CloudResource(
        name=resource.name,
        resource_type=resource.resource_type,
        provider=resource.provider,
        status=resource.status
    )

    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)

    return new_resource


@router.get("/", response_model=list[CloudResourceResponse])
def get_resources(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(CloudResource).all()


@router.get("/{resource_id}", response_model=CloudResourceResponse)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    resource = db.query(CloudResource).filter(
        CloudResource.id == resource_id
    ).first()

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return resource


@router.put("/{resource_id}", response_model=CloudResourceResponse)
def update_resource(
    resource_id: int,
    resource: CloudResourceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(CloudResource).filter(
        CloudResource.id == resource_id
    ).first()

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    existing.name = resource.name
    existing.resource_type = resource.resource_type
    existing.provider = resource.provider
    existing.status = resource.status

    db.commit()
    db.refresh(existing)

    return existing
@router.patch("/{resource_id}", response_model=CloudResourceResponse)
def patch_resource(
    resource_id: int,
    resource: CloudResourceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(CloudResource).filter(
        CloudResource.id == resource_id
    ).first()

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    update_data = resource.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing, key, value)

    db.commit()
    db.refresh(existing)

    return existing


@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(CloudResource).filter(
        CloudResource.id == resource_id
    ).first()

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    db.delete(existing)
    db.commit()

    return {
        "message": "Resource deleted successfully"
    }