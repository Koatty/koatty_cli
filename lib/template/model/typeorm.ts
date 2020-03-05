/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2020-01-06 20:35:11
 */
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { Component, Value } from 'koatty';
import { App } from '<Path>/App';

@Component()
@Entity('<ModelName>')
export class <ClassName> extends BaseEntity {
    app: App;

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;
}