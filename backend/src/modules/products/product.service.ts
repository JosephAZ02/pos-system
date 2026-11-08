import {ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {CreateProductDto} from "./dto/create-product.dto";
import {UpdateProductDto} from "./dto/update-product.dto";
import {Product} from "./entities/product.entity";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";


@Injectable()
export class ProductService {

    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) {

    }

    async save(request: CreateProductDto): Promise<Product> {

        const existing = await this.productRepo.findOneBy({sku: request.sku});
        if (existing !== null) {
            throw new ConflictException(`Ya existe un producto con el SKU: ${request.sku}`);
        }

        const product = this.productRepo.create(request);
        return await this.productRepo.save(product);
    }


    async update(id: number, request: UpdateProductDto) {

        const product = await this.getById(id);

        if (request.sku && request.sku !== product.sku) {
            const existing = await this.productRepo.findOneBy({sku: request.sku});
            if (existing !== null) {
                throw new ConflictException(`El SKU ${request.sku} ya está en uso por otro producto`);
            }
        }

        Object.assign(product, request);

        return await this.productRepo.save(product);
    }

    async remove(id: number): Promise<{ message: string }> {
        const product = await this.getById(id);
        product.isActive = false;
        await this.productRepo.save(product);
        return {message: `Producto ${product.name} deshabilitado`};
    }

    async getById(id: number): Promise<Product> {
        const product = await this.productRepo.findOneBy({id, isActive: true});
        if (!product) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        return product;
    }

    async getAll(): Promise<Product[]> {
        return await this.productRepo.find({
            where: {isActive: true},
            order: {name: 'ASC'},
        });
    }

}